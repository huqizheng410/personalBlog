const express = require("express");
const router = express.Router();

const userDao = require("../modules/users-dao.js");
const subscriptionDao = require("../modules/subscription-dao.js");
const { verifyAuthenticated } = require("../middleware/auth-middleware.js");
const sseClients = require("../modules/clientSubscription.js");

// Get sse notification set up. 
router.get('/notifications/sse', verifyAuthenticated, async function (req, res) {
    const authToken = req.cookies.authToken;
    const user = await userDao.retrieveUserWithAuthToken(authToken);

    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    sseClients[user.id] = res;

    req.on('close', () => {
        delete sseClients[user.id];
    });
});

// Get the current user's unread notification count.
router.get('/notifications/unreadCount', verifyAuthenticated, async function (req, res) {
    const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);
    const unreadCount = await subscriptionDao.getUnreadNotificationCount(user.id);
    res.json({ unreadCount });
});

// Get the current user's unread notification message.
router.get('/notifications/unread', verifyAuthenticated, async function (req, res) {
    const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);
    const notifications = await subscriptionDao.getUnreadNotifications(user.id);
    res.json(notifications);
});

// Mark the notification read. 
router.post('/notifications/read', verifyAuthenticated, async function (req, res) {
    const notificationId = req.body.notificationId;
    const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);
    await subscriptionDao.markNotificationAsRead(notificationId, user.id);
    res.sendStatus(200);
});

router.post('/notifications/readAll', verifyAuthenticated, async function (req, res) {
    const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);
    await subscriptionDao.markNotificationAsAllRead(user.id);
    res.sendStatus(200);
});

module.exports = router;
