const express = require("express");
const router = express.Router();
const fs = require('fs');
const { verifyAuthenticated } = require("../middleware/auth-middleware.js");
const userDao = require("../modules/users-dao.js");
const subscriptionDao = require("../modules/subscription-dao.js");
const analysisDao = require("../modules/analysis-dao.js");

// Once the user try to view the user portfolio, identify the user's states
// If not login in, only view author page, same as log in but view others's page
// If the user is looking at his/her portfolio, enable the edit function which allow user to modify the portfolio.
router.get("/userdetail/:username", async function (req, res) {
    const username = req.params['username'];
    const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);
    const author = await userDao.retrieveUserByUsername(username);

    if(author == undefined){
        res.redirect("/404");
        return;
    }

    const subscriberNum = await analysisDao.getSubscriberCount(author.id);
    const followerNum = await analysisDao.getFollowerCount(author.id);
    const articleNum = await analysisDao.getArticleCount(author.id);
    const account_analyis_data = { subscribe: subscriberNum, followers: followerNum, atricles: articleNum, authorname: username };
    res.locals.account_analyis_data = account_analyis_data;

    if (user === undefined) {
        res.locals.login = false;
        res.locals.author = author;
    } else {
        const isSubscribed = await subscriptionDao.checkSubscription(user.id, author.id);
        if (JSON.stringify(author) === JSON.stringify(user)) {
            res.locals.currentUser = user;
        } else {
            res.locals.author = author;
        }
        res.locals.isSubscribed = isSubscribed;
    }
    res.locals.authorId = author.id;
    res.render("user_portfolio");
});

// Modify the subscribe states
router.post("/subscribe/:authorId", async function (req, res) {
    const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);
    if (user == null) {
        res.sendStatus(406);
    } else {
        const authorId = req.params.authorId;
        const currentState = req.body.state;
        await subscriptionDao.modifySubscriptionState(user.id, authorId, currentState);
        if (currentState !== "subscribed") {
            await subscriptionDao.createNotification(authorId, user.id, ` has started following you`);
        }
        res.sendStatus(200);
    }
});

// Retrieve all avatars from the public file, and reponse as json. 
router.get("/getAllAvatars", async function (req, res) {
    fileNames = fs.readdirSync(`./public/uploadedAvatar/thumbnails`);
    res.json(fileNames);
});

// Update user's information
router.post("/updateUser", verifyAuthenticated, async function (req, res) {
    const userData = req.body;
    await userDao.modifyUserByUsername(userData);
});

module.exports = router;