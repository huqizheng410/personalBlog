const express = require("express");
const router = express.Router();
const { verifyAuthenticated } = require("../middleware/auth-middleware.js");
const userDao = require("../modules/users-dao.js");
const articleDao = require("../modules/article-dao.js");
const analysisDao = require("../modules/analysis-dao.js");
const subscriptionDao = require("../modules/subscription-dao.js");

// Get the number of all subscriber, follower and articles
router.get("/managesubscription", verifyAuthenticated, async function (req, res) {
    const username = req.query.username;
    const usernameTrimed = username.trim();
    const user = await userDao.retrieveUserByUsername(usernameTrimed);
    const subscriberNum = await analysisDao.getSubscriberCount(user.id);
    const followerNum = await analysisDao.getFollowerCount(user.id);
    const articleNum = await analysisDao.getArticleCount(user.id);
    const account_analyis_data = {
      subscribe: subscriberNum,
      followers: followerNum,
      atricles: articleNum,
      authorname: usernameTrimed,
    };
    res.locals.account_analyis_data = account_analyis_data;

    const subscriberName = req.query.subscriberName;
    if (subscriberName) {
      const subscriberNameTrimed = subscriberName.trim();
      const subuser = await userDao.retrieveUserByUsername(
        subscriberNameTrimed
      );
      const Subscribers = await subscriptionDao.retrieveSubscriberById(
        subuser.id
      );
      const authToken = req.cookies.authToken;
      const user = await userDao.retrieveUserWithAuthToken(authToken);
      let ableToUnsubscribe =
        user.username == subscriberNameTrimed ? true : false;
      res.locals.ableToUnsubscribe = ableToUnsubscribe;
      res.locals.Subscribers = Subscribers;
    }

    const followerName = req.query.followerName;
    if (followerName) {
      const followerNameTrimed = followerName.trim();
      const foluser = await userDao.retrieveUserByUsername(followerNameTrimed);
      const Followers = await subscriptionDao.retrieveFollowerById(foluser.id);
      const authToken = req.cookies.authToken;
      const user = await userDao.retrieveUserWithAuthToken(authToken);
      let ableToRemove = user.username == followerNameTrimed ? true : false;
      res.locals.ableToRemove = ableToRemove;
      res.locals.Followers = Followers;
    }

    const writerName = req.query.writerName;
    if (writerName) {
      const writerNameTrimed = writerName.trim();
      const writer = await userDao.retrieveUserByUsername(writerNameTrimed);
      const Articles = await articleDao.retriveArticleByWriterId(writer.id);
      for (let index = 0; index < Articles.length; index++) {
        const element = Articles[index];
        const words = element.content.replace(/<[^>]*>?/gm, "");
        const shortContent = words.slice(0, 200);
        element.content = shortContent;
      }
      const authToken = req.cookies.authToken;
      const user = await userDao.retrieveUserWithAuthToken(authToken);
      let isAuthor = user.username == writerNameTrimed ? true : false;
      Articles.forEach((article) => {
        article.isAuthor = isAuthor;
      });
      res.locals.Articles = Articles;
    }
    res.render("manage_subscription");
  }
);

// Delete the follower by given id and author
router.get("/deleteFollower", verifyAuthenticated, async function (req, res) {
  const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);
  const followerid = req.query.userid;
  const authorid = req.query.authorid;
  const author = await userDao.retrieveUserById(authorid);
  if (user.id == authorid) {
    await subscriptionDao.unsubscribe(followerid, authorid);
  }
  res.redirect(`/userdetail/${author.username}`);
});

// Delete the subscriber by given id and user id.
router.get("/unsubscribe", verifyAuthenticated, async function (req, res) {
  const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);
  const followerid = req.query.userid;
  const authorid = req.query.authorid;
  const follower = await userDao.retrieveUserById(followerid);
  if (user.id == followerid) {
    await subscriptionDao.unsubscribe(followerid, authorid);
  }
  res.redirect(`/userdetail/${follower.username}`);
});

module.exports = router;
