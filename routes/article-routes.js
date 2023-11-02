const express = require("express");
const router = express.Router();
const articleDao = require("../modules/articledetails-dao.js");
const subscriptionDao = require("../modules/subscription-dao.js");

// API to article details page through article id
router.get("/article/:id", async function (req, res) {
  const articleId = parseInt(req.params.id);
  const userInfo = res.locals.user;
  // check if user login
  let userId = "";
  if (userInfo) {
    userId = userInfo.id;
  }
  const articleDetails = await articleDao.retrieveArticleDetailsById(
    articleId,
    userId
  );
  if (typeof articleDetails.article === "undefined") {
    res.locals.title = "Article Not Found";
  } else {
    const createDate = new Date(articleDetails.article.create_date);
    articleDetails.article.create_date = createDate.toLocaleString();
    // check if user is the author
    if (articleDetails.article.user_id === userId) {
      res.locals.isAuthor = true;
    }
    res.locals.title = articleDetails.title;
    res.locals.article = articleDetails.article;
    res.locals.likesCount = articleDetails.like;
    if (articleDetails.imgUrl !== undefined) {
      res.locals.imgUrl = articleDetails.imgUrl.url;
    }

    // check if user like the article
    if (articleDetails.userLike === 0) {
      // if user not like the article
      res.locals.userLikeStatus = false;
      res.locals.likeButtonText = "Like";
      res.locals.likeButtonStyle = "Like";
    } else {
      // if user like the article
      res.locals.userLikeStatus = true;
      res.locals.likeButtonText = "Liked";
      res.locals.likeButtonStyle = "liked-button";
    }
  }
  res.render("article");
});

// APT to add new like
router.post("/article/likes", async function (req, res) {
  const articleId = parseInt(req.body.articleId);
  const userId = parseInt(req.body.userId);
  const result = await articleDao.addUserLike(articleId, userId);
  await subscriptionDao.createNotificationInLike(articleId, userId);
  res.status(200).json(result);
});

// APT to remove like
router.delete("/article/likes", async function (req, res) {
  const articleId = parseInt(req.body.articleId);
  const userId = parseInt(req.body.userId);
  const result = await articleDao.removeUserLike(articleId, userId);
  res.status(200).json(result);
});

// APT to get comments by article id
router.get("/comments", async function (req, res) {
  const articleId = parseInt(req.query.articleId);
  const comments = await articleDao.queryCommentsByArticleId(articleId);

  // Change date format for all comments
  const commentsDataFormat = comments.map((comment) => {
    const createDate = new Date(comment.create_date);
    comment.create_date = createDate.toLocaleString();
    return comment;
  });

  // handle comments data
  const commentsTree = commentsDataProcess(commentsDataFormat);
  res.status(200).json(commentsTree);
});

// process comments data to tree structure
function commentsDataProcess(comments, parentCommentId = null) {
  const result = [];
  for (const comment of comments) {
    if (comment.parent_comment_id === parentCommentId) {
      const children = commentsDataProcess(comments, comment.id);
      if (children.length > 0) {
        comment.children = children;
      }
      result.push(comment);
    }
  }
  return result;
}

//  APT to add new comment
router.post("/comments", async function (req, res) {
  const articleId = parseInt(req.body.articleId);
  const userId = parseInt(req.body.userId);
  const comment = req.body.comment;
  let parentId = req.body.parentId;
  if (parentId !== null) {
    parentId = parseInt(parentId);
  }

  // get current date time
  const currentDatea = new Date();
  const create_date = currentDatea.toISOString();

  const result = await articleDao.addComment(
    articleId,
    userId,
    comment,
    parentId,
    create_date
  );
  await subscriptionDao.createNotificationInComment(
    articleId,
    userId,
    parentId
  );
  res.status(200).json(result);
});

//  APT to delete comment
router.delete("/comments", async function (req, res) {
  const commentId = parseInt(req.body.commentId);
  const result = await articleDao.removeComment(commentId);
  res.status(200).json(result);
});

module.exports = router;
