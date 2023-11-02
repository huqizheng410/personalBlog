const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");

// query article details by article id
async function retrieveArticleDetailsById(articleId, userId) {
  const db = await dbPromise;
  const queryArticleDetails = db.get(
    SQL`SELECT a.id, title, create_date, content, user_id, username, avatar FROM articles a JOIN users u on a.user_id = u.id WHERE a.id = ${articleId}`
  );
  const queryImgUrl = db.get(
    SQL`SELECT url FROM images WHERE article_id = ${articleId}`
  );
  const queryArticleLikesCount = db.get(
    SQL`SELECT COUNT() FROM users_like WHERE article_id = ${articleId}`
  );
  const queryUserLikeStatus = db.get(
    SQL`SELECT COUNT() FROM users_like WHERE article_id = ${articleId} AND user_id = ${userId}`
  );

  const [articleDetails, imgUrl, likesCount, userLikeStatus] =
    await Promise.all([
      queryArticleDetails,
      queryImgUrl,
      queryArticleLikesCount,
      queryUserLikeStatus,
    ]);

  return {
    article: articleDetails,
    imgUrl: imgUrl,
    like: likesCount["COUNT()"],
    userLike: userLikeStatus["COUNT()"],
  };
}

// insert user like info and retuen like count
async function addUserLike(articleId, userId) {
  const db = await dbPromise;
  const insertSQL = db.run(
    SQL`INSERT INTO users_like (user_id, article_id) VALUES (${userId},${articleId});`
  );
  const queryArticleLikesCount = db.get(
    SQL`SELECT COUNT() FROM users_like WHERE article_id = ${articleId}`
  );

  const [insertResult, likesCount] = await Promise.all([
    insertSQL,
    queryArticleLikesCount,
  ]);

  return {
    result: insertResult,
    likeCount: likesCount["COUNT()"],
  };
}

// remove user like info and return like count
async function removeUserLike(articleId, userId) {
  const db = await dbPromise;
  const deleteSQL = db.run(
    SQL`DELETE FROM users_like WHERE user_id = ${userId} AND article_id = ${articleId};`
  );

  const queryArticleLikesCount = db.get(
    SQL`SELECT COUNT() FROM users_like WHERE article_id = ${articleId}`
  );

  const [deleteResult, likesCount] = await Promise.all([
    deleteSQL,
    queryArticleLikesCount,
  ]);
  return {
    result: deleteResult,
    likeCount: likesCount["COUNT()"],
  };
}

// query comments info
async function queryCommentsByArticleId(articleId) {
  const db = await dbPromise;
  const comments = await db.all(
    SQL`SELECT c.*, u.username, u.avatar FROM comments c JOIN users u ON c.user_id = u.id WHERE article_id = ${articleId} ORDER BY create_date`
  );
  return comments;
}

// insert comment info
async function addComment(articleId, userId, content, parentId, time) {
  const db = await dbPromise;
  const insertSQLResult = await db.run(
    SQL`INSERT INTO comments (article_id, user_id, content, create_date, parent_comment_id) VALUES (${articleId}, ${userId}, ${content}, ${time},  ${parentId})`
  );
  return insertSQLResult;
}

// remove comment info
async function removeComment(commentId) {
  const db = await dbPromise;
  const deleteSQLResult = await db.run(
    SQL`WITH RECURSIVE delete_comments AS (   
        SELECT id FROM comments WHERE id = ${commentId}
        UNION ALL
        SELECT c.id FROM comments c
        JOIN delete_comments dc ON c.parent_comment_id = dc.id)
        DELETE FROM comments WHERE id IN (SELECT id FROM delete_comments);`
  );
  return deleteSQLResult;
}

// Export functions.
module.exports = {
  retrieveArticleDetailsById,
  addUserLike,
  removeUserLike,
  queryCommentsByArticleId,
  addComment,
  removeComment,
};
