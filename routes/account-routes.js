const { v4: uuid } = require("uuid");
const express = require("express");
const router = express.Router();
const fs = require('fs');
const subscriptionDao = require("../modules/subscription-dao.js");
const userDao = require("../modules/users-dao.js");
const { verifyAuthenticated } = require("../middleware/auth-middleware.js");

// Whenever we navigate to /login, if we're already logged in, redirect to "/".
// Otherwise, render the "login" view.
router.get("/login", function (req, res) {
    if (res.locals.user) {
        res.redirect("/");
    } else {
        const message = req.cookies.message;
        res.locals.loginPage = true;
        res.render("login", { message: message });
        res.clearCookie("message");
    }

});

router.post("/login", async function (req, res) {
    // Get the username and password submitted in the form
    const username = req.body.username;
    const password = req.body.password;
    // Find a matching user in the database
    const user = await userDao.retrieveUserWithCredentials(username, password);
    // if there is a matching user
    if (user) {
        // Auth success - give that user an authToken, save the token in a cookie, and redirect to the homepage.
        const authToken = uuid();
        user.authToken = authToken;
        await userDao.updateUser(user);
        res.cookie("authToken", authToken);
        res.locals.user = user;
        res.render("homepage");
    } else {
        res.locals.user = null;
        res.status(401);
        res.render("login", {
            message: "The username or password you entered is incorrect.",
        });
    }
});

// Read through all the possible avatars and render to the handlebars. 
router.get("/newAccount", function (req, res) {
    const fileNames = fs.readdirSync(`./public/uploadedAvatar/thumbnails`)
    res.locals.avatars = fileNames;
    res.locals.signupPage = true;
    res.render("new-account");
});

// Check whether the username in parameter is exist or not
router.get("/newAccount/username/:username", async function (req, res) {
    let username = req.params['username'];
    let userExsist = await userDao.retriveUsernameValidation(username);
    if (userExsist) {
        res.status(200).json({ message: "already exist" });
    } else {
        res.status(204).json({ message: "valid username" });
    }
});

//This receieve the new user form and 
router.post("/newAccount", async function (req, res) {
    const username = req.body.username;
    const hashedpassword = await userDao.hashpassword(req.body.password);
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const avatar = req.body.avatar;
    const birthday = req.body.birthday;
    let description = req.body.description;
    if (description === '') {
        description = 'Oops, it looks like there is nothing here.';
    }
    const user = { userName: username, hashedPassword: hashedpassword, birthday: birthday, firstName: firstname, lastName: lastname, description: description, avatar: avatar };
    await userDao.createUser(user);
    const currentUser = await userDao.retrieveUserByUsername(username);
    await subscriptionDao.createNotification(currentUser.id, 1, `Hello, ${currentUser.username}! Welcome to register for our blog. You are user No. ${currentUser.id}. We hope you have a great time here.`);

    res.cookie('message', 'You have registered successfully. Please sign in.');
    res.redirect('/login');
});


// Whenever we navigate to /logout, delete the authToken cookie.
// redirect to "/login", supplying a "logged out successfully" message.
router.get("/logout", async function (req, res) {
    const authToken = req.cookies.authToken;
    await userDao.clearUserAuthToken(authToken);
    res.clearCookie("authToken");
    res.status(204);
    res.redirect("./");
});

// Retrieve the current user's id and username, and render to handlebars shows greeting message, shows change password layout. 
router.get("/changePassword", verifyAuthenticated, async function (req, res) {
    const authToken = req.cookies.authToken;
    const user = await userDao.retrieveUserWithAuthToken(authToken);
    res.locals.userid = user.id;
    res.locals.username = user.username;
    res.locals.changePassword = true;
    res.render("password_check");
});

// Retrieve the current user's id and username, and render to the handlebars shows delete account layout
router.get("/deleteAccount", verifyAuthenticated, async function (req, res) {
    const authToken = req.cookies.authToken;
    const user = await userDao.retrieveUserWithAuthToken(authToken);
    res.locals.userid = user.id;
    res.locals.username = user.username;
    res.locals.delete = true;
    res.render("password_check");
});

// Get the old and new password from user, check if it matched, and render to different page accordingly. 
router.post("/changePassword", verifyAuthenticated, async function (req, res) {
    const { oldPassword, newPassword } = req.body;
    const authToken = req.cookies.authToken;

    // Retrieve the user and response locals of the changePassword and user. 
    const user = await userDao.retrieveUserWithAuthToken(authToken);

    res.locals = {
        changePassword: true,
        user,
    };

    // If thepassword is not correct, render back to the handlebars. 
    // Since we have verifyAuthenticated middleware so we user should be exist. 
    if (!(await userDao.retrieveUserWithCredentials(user.username, oldPassword))) {
        res.locals.message = "Your old password is incorrect, please try again.";
    } else {
        const hashed_password = await userDao.hashpassword(newPassword);
        await userDao.changePassword(user.id, hashed_password);
        res.locals.message = "Your password has been successfully changed!";    
    }
    res.render("password_check");
});

// Retrieve the current user's id and password, verify the user is able to delete the account or not
router.post("/deleteAccount", async function (req, res) {
    const authToken = req.cookies.authToken;
    const password = req.body.password;
    let user = await userDao.retrieveUserWithAuthToken(authToken);
    user = await userDao.retrieveUserWithCredentials(user.username, password);

    if (user) {
        await userDao.deleteUser(user.id);
        res.clearCookie("authToken");
        res.redirect("/");
    } else {
        res.locals.delete = true;
        res.locals.message = "Your password is incorrect";
        res.render("password_check");
    }
});

module.exports = router;
