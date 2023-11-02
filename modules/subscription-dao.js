const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");
const sseClients = require("./clientSubscription.js");

// Create new notification by retrieve relevant information and insert into database
async function createNotification(user_id, sender_id, message, article_id = null) {
    const db = await dbPromise;
    let query = SQL`
        INSERT INTO notifications (user_id, sender_id, content, article_id, read, created_at)
        VALUES (${user_id}, ${sender_id}, ${message}, ${article_id}, false, ${new Date().toISOString()})
    `;
    await db.run(query);

    if (sseClients[user_id]) {
        let unreadCount = await db.get(SQL`
            SELECT COUNT(*) AS count FROM notifications WHERE user_id = ${user_id} AND read = false
        `);
        sseClients[user_id].write(`data: ${unreadCount.count}\n\n`);
    }
}

// Receive the specific content and parent ID of a comment, and then invoke the notification method for each person who needs to be notified.
async function createNotificationInComment(articleId, userId, parentId) {
    const db = await dbPromise;
    let parentUserId;
    if (parentId) {
        const parentComment = await db.get(SQL`
            SELECT user_id, parent_comment_id, content FROM comments WHERE id = ${parentId}
        `);
        parentUserId = parentComment.user_id;
        await createNotification(parentUserId, userId, `has replied to your comment:${parentComment.content}.`, articleId);

        if (parentComment.parent_comment_id) {
            await createNotificationInComment(articleId, userId, parentComment.parent_comment_id);
        }
    }

    const article = await db.get(SQL`
        SELECT user_id, title FROM articles WHERE id = ${articleId}
    `);

    const articleUserId = article.user_id;
    if (!parentId || articleUserId !== parentUserId) {
        await createNotification(articleUserId, userId, `has commented on your article: ${article.title}.`, articleId);
    }
}

// Receive the article id and user id who like the article, and then invoke the notification method for the author of the article. 
async function createNotificationInLike(articleId, userId) {
    const db = await dbPromise;
    const article = await db.get(SQL`
        SELECT title, user_id FROM articles WHERE id = ${articleId}
    `);
    const articleName = article.title;
    const authorId = article.user_id;
    const message = `has liked your article ${articleName}`;
    await createNotification(authorId, userId, message, articleId);
}

// Receive the author id, and then invoke the notification method for all of the author's followers.
async function createNotificationInNewArticle(author_id, article_id) {
    const db = await dbPromise;

    const author = await db.get(SQL`
        SELECT username FROM users WHERE id = ${author_id}
    `);

    if (!author) {
        throw new Error(`Author with id ${author_id} does not exist`);
    }

    const subscribers = await db.all(SQL`
        SELECT user_id FROM subscriptions_list WHERE author_id = ${author_id}
    `);

    for (let subscriber of subscribers) {
        const message = ` has published a new article.`;
        await createNotification(subscriber.user_id, author_id, message, article_id);
    }
}

// Retrieve the user id to get all unread notifications
async function getUnreadNotifications(user_id) {
    const db = await dbPromise;
    const notifications = await db.all(SQL`
    SELECT notifications.id, notifications.content, notifications.created_at, users.username AS sender_username, users.avatar AS sender_avatar, notifications.article_id
    FROM notifications
    JOIN users ON notifications.sender_id = users.id
    WHERE notifications.user_id = ${user_id} AND notifications.read = false
    `);
    return notifications;
}

// Retrieve the user id and notification id to modify the state of read to be true.
async function markNotificationAsRead(notificationId, userId) {
    const db = await dbPromise;
    await db.run(SQL`
    UPDATE notifications
    SET read = true
    WHERE id = ${notificationId} AND user_id = ${userId}
    `);
}

// Retrieve the user id to get the number of notification count, in order to update the count number in nav.
async function getUnreadNotificationCount(user_id) {
    const db = await dbPromise;
    let unreadCount = await db.get(SQL`
        SELECT COUNT(*) AS count FROM notifications WHERE user_id = ${user_id} AND read = false
    `);
    return unreadCount.count;
}

// Let follower unsubscribe the author and write change in the database, when make sure the follower is subscribe the author. 
async function unsubscribe(followerId, authorId) {
    const db = await dbPromise;
    let query = SQL`DELETE FROM subscriptions_list WHERE user_id = ${followerId} AND author_id =${authorId} `;
    await db.run(query);
}

// Switch the subscription state. 
async function modifySubscriptionState(userId, authorId, currentState) {
    const db = await dbPromise;
    if (currentState === "subscribed") {
        await db.run(SQL`
            DELETE FROM subscriptions_list
            WHERE user_id = ${userId} AND author_id = ${authorId}
        `);
    } else if (currentState === "not-subscribed") {
        await db.run(SQL`
            INSERT INTO subscriptions_list (user_id, author_id)
            VALUES (${userId}, ${authorId})
        `);
    }
}

// Using id to retrieve the subscriber's information
async function retrieveSubscriberById(userId) {
    const db = await dbPromise;
    const result = await db.all(SQL`
    SELECT username,avatar,description,subscriptions_list.author_id,subscriptions_list.user_id
    FROM users,subscriptions_list
    WHERE  subscriptions_list.author_id = users.id
	AND subscriptions_list.user_id = ${userId}
`);
    return result;
}

// Check the current user is subscription another user
async function checkSubscription(userId, authorId) {
    const db = await dbPromise;
    const result = await db.get(SQL`
    SELECT * FROM subscriptions_list
    WHERE user_id = ${userId} AND author_id = ${authorId}
`);
    return result;
}

// Using the author id to retrieve the follower's information
async function retrieveFollowerById(author_id) {
    const db = await dbPromise;
    const result = await db.all(SQL`
    SELECT username,avatar,description,subscriptions_list.author_id,subscriptions_list.user_id
    FROM users,subscriptions_list
    WHERE  subscriptions_list.user_id = users.id
	AND subscriptions_list.author_id = ${author_id}
`);
    return result;
}

// Retrieve the notification id and return the user_id.
async function getNotificationUserId(id) {
    const db = await dbPromise;
    const notification = await db.get(SQL`SELECT * FROM notifications WHERE id = ${id}`);
    return notification.user_id;
}

// Retrieve the user id and notification id to modify the state of read to be true.
async function markNotificationAsAllRead(userId) {
    const db = await dbPromise;
    await db.run(SQL`
    UPDATE notifications
    SET read = true
    WHERE user_id = ${userId}
    `);
}


module.exports = {
    createNotification,
    getUnreadNotificationCount,
    getUnreadNotifications,
    markNotificationAsRead,
    createNotificationInComment,
    createNotificationInLike,
    unsubscribe,
    createNotificationInNewArticle,
    modifySubscriptionState,
    retrieveSubscriberById,
    checkSubscription,
    retrieveFollowerById,
    getNotificationUserId,
    markNotificationAsAllRead
};
