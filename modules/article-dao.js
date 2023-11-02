const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");

//Find the article object with the given article id
async function retriveArticleById(id) {
    const db = await dbPromise;
    const result = await db.get(SQL`
        SELECT * FROM articles
        WHERE id = ${id}
    `);
    return result;
}

// Create new Article and write into database
async function createArticle(articleTobeCreate) {
    const db = await dbPromise;
    const result = await db.run(SQL`
        INSERT INTO articles (title, create_date, content, user_id)
        VALUES (${articleTobeCreate.title}, ${articleTobeCreate.create_date},${articleTobeCreate.content},${articleTobeCreate.user_id});
    `);
    const latestArticle = await db.get(SQL`
        SELECT * FROM articles
        WHERE id = ${result.lastID}
    `);
    return latestArticle;
}

// Update article's title and content
async function updateArticle(article) {
    const db = await dbPromise;
    await db.run(SQL`UPDATE articles SET title = ${article.title}, content = ${article.content} WHERE id = ${article.id}`);
}

// Delete the original image and insert the new one
async function insertImageData(url, articleid) {
    const db = await dbPromise;
    await db.run(SQL`
        DELETE FROM images where article_id = ${articleid};
    `);
    await db.run(SQL`
        INSERT INTO images (url, article_id) values (${url}, ${articleid});
    `);
}

// Verify if the current user has author permissions.
async function verifyArticleEditAuthenticated(authToken, writerId) {
    const db = await dbPromise;
    const currentUser = await db.get(SQL`
        SELECT * FROM users
        WHERE auth_token = ${authToken}
    `);
    return currentUser.id == writerId;
}

// Retrieve the article image's url by article id
async function retriveImageByArticleId(articleId) {
    const db = await dbPromise;
    const imageUrl = await db.get(SQL`
        SELECT url FROM images
        WHERE article_id = ${articleId}
    `);
    return imageUrl;
}

// Using writer id to retrieve particular article
async function retriveArticleByWriterId(wrtiterId) {
    const db = await dbPromise;
    const results = await db.all(SQL`
        SELECT avatar,username,create_date,title,content,articles.id
        FROM users,articles
        WHERE  articles.user_id = users.id
        AND articles.user_id = ${wrtiterId}
    `);
    for (let result of results) {
        result.create_date = formatSqliteDate(result.create_date);
    }
    return results;
}

// Delete particle article by article id
async function deleteArticleByArticleId(articleId) {
    const db = await dbPromise;
    await db.run(SQL`
        DELETE FROM articles WHERE id = ${articleId}
    `);
}

// Retrieve sort by value, and return sorted articles. 
async function retrieveArticles(sortBy = "date") {
    const db = await dbPromise;
    let query = SQL`
        SELECT articles.*, users.username, images.url AS image_url
        FROM articles 
        INNER JOIN users ON articles.user_id = users.id
        LEFT JOIN (
            SELECT id AS image_id, url, article_id
            FROM images
            GROUP BY article_id
        ) images ON images.article_id = articles.id
    `;
    if (sortBy) {
        if (sortBy === "title") {
            query.append(SQL` order by title COLLATE NOCASE`);
        } else if (sortBy === "username") {
            query.append(SQL` order by users.username COLLATE NOCASE`);
        } else if (sortBy === "date") {
            query.append(SQL` order by create_date DESC`);
        }
    }
    const articles = await db.all(query);

    // Convert the SQLite Date format to readable format (Adding PM and AM). 
    for (let article of articles) {
        article.create_date = formatSqliteDate(article.create_date);
    }

    return articles;
}

// Convert from database date to Nz time date
function formatSqliteDate(date) {
    let dateObj = new Date(date);

    const formatter = new Intl.DateTimeFormat('en-NZ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    return formatter.format(dateObj);
}


module.exports = {
    retriveArticleById,
    createArticle,
    updateArticle,
    insertImageData,
    verifyArticleEditAuthenticated,
    retriveImageByArticleId,
    retriveArticleByWriterId,
    deleteArticleByArticleId,
    retrieveArticles
}
