const express = require("express");
const router = express.Router();

const analysisDao = require("../modules/analysis-dao.js");
const userDao = require("../modules/users-dao.js");
const { verifyAuthenticated } = require("../middleware/auth-middleware.js");

// response the json of particle user's analysis informations
router.get("/analysis/data/:userid", verifyAuthenticated, async function (req, res) {
    let userid = req.params['userid'];

    const followerCount = await analysisDao.getFollowerCount(userid);
    const commentCount = await analysisDao.getCommentCount(userid);
    const likeCount = await analysisDao.getLikeCount(userid);
    const topThreeArticles = await analysisDao.getTopThreeArticles(userid);
    const dailyCommentCount = await analysisDao.getDailyCommentCount(userid);

    res.json({
        followerCount: followerCount,
        commentCount: commentCount,
        likeCount: likeCount,
        topThreeArticles: topThreeArticles,
        dailyCommentCount: dailyCommentCount
    });
});

// Identify the current user and render to the analysis page. 
router.get("/analysis", verifyAuthenticated, async function (req, res) {
    const authToken = req.cookies.authToken;
    const user = await userDao.retrieveUserWithAuthToken(authToken);
    res.locals.analysisPage = true;
    res.render("analysis", { userId: user.id });
});

module.exports = router;