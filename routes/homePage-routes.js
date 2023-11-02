const express = require("express");
const router = express.Router();

const articleDao = require("../modules/article-dao.js");
const userDao = require("../modules/users-dao.js");

// The default path, render to homepage.handlebars
router.get(["/", "/home", "/homepage"], function(req, res) {
    res.locals.homePage = true;
    res.render("homepage");
});

// Get the user's username and avatar of user id. 
router.get("/homepageUserDetails/:userid", async function(req, res) {
    let userid = req.params['userid'];
    const user = await userDao.retrieveUserById(userid);

    const response = {
        username: user.username,
        avatar: user.avatar
    };

    res.json(response);
});

// Indicate in sign up process, if the username already exist. 
router.get("/newAccount/username/:username", async function (req, res) {
    let username = req.params['username'];
    let userExsist = await userDao.retriveUsernameValidation(username);
    if (userExsist) {
        res.status(200).json({ message: "already exist" });
    } else {
        res.status(204).json({ message: "valid username" });
    }
});

// Get all article details, response as json object. 
router.get("/articlesDetails", async function(req, res) {
    const sortBy = req.query.sortBy;
    const articles = await articleDao.retrieveArticles(sortBy);
    res.json(articles);
});


module.exports = router;