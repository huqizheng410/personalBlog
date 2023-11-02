const express = require("express");
const router = express.Router();
const {v4: uuid} = require("uuid");
const userDao = require("../modules/users-dao.js");

// middleware to check if the user is an admin
const isAdmin = async (req, res, next) => {
    const authToken = req.cookies.authToken;
    if (!authToken) {
        res.sendStatus(401);
        return;
    }
    const user = await userDao.retrieveUserWithAuthToken(authToken);
    const admin = await checkIfAdmin(user);
    if (user && admin) {
        next();
    } else {
        res.sendStatus(401);
    }
};

// login route, verify if the user has authority to log in as admin.
router.post("/api/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const user = await userDao.retrieveUserWithCredentials(username, password);
    if (user) {
        // Auth success - give that admin an authToken, save the token in a cookie, and redirect to the homepage.
        const authToken = uuid();
        user.authToken = authToken;
        await userDao.updateUser(user);
        res.cookie("authToken", authToken);
        res.sendStatus(204);
    } else {
        res.sendStatus(401);
    }
});

// logout route, clear the cookies and response a status of 204.
router.get("/api/logout", async (req, res) => {
    await userDao.clearUserAuthToken(req.cookies.authToken);
    res.clearCookie("authToken");
    res.sendStatus(204);
});

// users route, Retrieve all the user's infomration and article count, response the json.
router.get("/api/users", isAdmin, async (req, res) => {
    const users = await userDao.getUserAndArticleCount();
    res.json(users);
});

// delete user route, verify the admin and delete the user account, response status of 204 if success.
router.delete("/api/users/:id", isAdmin, async (req, res) => {
    const userId = req.params.id;
    await userDao.deleteUser(userId);
    res.sendStatus(204);
});

async function checkIfAdmin(user) {
    if (user !== null && user !== undefined) {
        // authentication whethre the user is admin
        return await userDao.checkAdmin(user.id);
    }
}

module.exports = router;
