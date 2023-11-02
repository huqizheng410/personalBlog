const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");

// Get total follower count by user id
async function getFollowerCount(id) {
    const db = await dbPromise;
    const result = await db.get(SQL`
        SELECT COUNT(*) as follower_count
        FROM subscriptions_list
        WHERE author_id = ${id}`);
    return result.follower_count;
}

// Get total subscriber count by user id
async function getSubscriberCount(userId) {
    const db = await dbPromise;
    const result = await db.get(SQL`
    SELECT COUNT(*) as subscriber_count
        FROM subscriptions_list
        WHERE user_id = ${userId}`);
    return result.subscriber_count;
}

// Get total articles count by user id
async function getArticleCount(author_Id) {
    const db = await dbPromise;
    const result = await db.get(SQL` 
    SELECT COUNT(*) as article_count
        FROM articles
        WHERE user_id = ${author_Id}`);
    return result.article_count;
}


// Get total comment count by user id
async function getCommentCount(id) {
    const db = await dbPromise;

    const result = await db.get(`SELECT (SELECT COUNT(*) 
        FROM comments 
        JOIN articles ON comments.article_id = articles.id 
        WHERE articles.user_id = ${id}) 
        +
        (SELECT COUNT(*) 
        FROM comments AS c1
        WHERE c1.parent_comment_id IN (
            SELECT c2.id
            FROM comments AS c2
            WHERE c2.user_id = ${id})) as comment_count`);

    return result.comment_count;
}

// Get total like count by user id
async function getLikeCount(id) {
    const db = await dbPromise;
    const result = await db.get(SQL`
        SELECT COUNT(*) as like_count
        FROM users_like
        JOIN articles ON users_like.article_id = articles.id
        WHERE articles.user_id = ${id}`);
    return result.like_count;
}

// Get popularity data for the specific user top three articles
// The algorithm for the heat value is as follows: The base value is 1000, any comment adds 8, and any like adds 3.
async function getTopThreeArticles(id) {
    const db = await dbPromise;
    const result = await db.all(SQL`
        SELECT articles.id, articles.title, images.url as thumbnail, articles.create_date,
            (SELECT COUNT(*) FROM comments WHERE article_id = articles.id) as comment_count,
            (SELECT COUNT(*) FROM users_like WHERE article_id = articles.id) as like_count,
            (1000 + 8 * (SELECT COUNT(*) FROM comments WHERE article_id = articles.id) 
                + 3 * (SELECT COUNT(*) FROM users_like WHERE article_id = articles.id)) as popularity
        FROM articles
        LEFT JOIN images ON images.article_id = articles.id
        WHERE user_id = ${id}
        ORDER BY popularity DESC
        LIMIT 3`);

    // Convert the SQLite Date format to readable format (Adding PM and AM).
    for (let article of result) {
        let dateObj = new Date(article.create_date);

        const formatter = new Intl.DateTimeFormat('en-NZ', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    
        let formattedDate = formatter.format(dateObj);
        article.create_date = formattedDate;
    }

    return result;
}


// Get daily comment count for the specific user past ten days
async function getDailyCommentCount(id) {
    const db = await dbPromise;
    const result = await db.all(SQL`
        SELECT STRFTIME('%Y-%m-%d', comments.create_date) as date, COUNT(*) as comment_count
        FROM comments
        JOIN articles ON comments.article_id = articles.id
        WHERE articles.user_id = ${id} AND STRFTIME('%Y-%m-%d', comments.create_date) >= STRFTIME('%Y-%m-%d', DATE('now', '-10 day'))
        GROUP BY date
        ORDER BY date`);
    return result;
}


module.exports = {
    getFollowerCount,
    getSubscriberCount,
    getArticleCount,
    getCommentCount,
    getLikeCount,
    getTopThreeArticles,
    getDailyCommentCount
}
