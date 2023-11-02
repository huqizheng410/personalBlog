const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");
const bcrypt = require('bcryptjs');

// Creating the user information and stored in the database
async function createUser(user) {
    const db = await dbPromise;
    const result = await db.run(SQL`
        insert into users (username, hashed_password, birthday, first_name, last_name, description, avatar) 
        values (${user.userName}, ${user.hashedPassword}, ${user.birthday}, ${user.firstName}, ${user.lastName},
            ${user.description},${user.avatar})`);

    user.id = result.lastID;
}

// Check if the user name exist in the database, return ture is yes, otherwise false
async function retriveUsernameValidation(username) {
    const db = await dbPromise;
    const user = await db.get(SQL`
        select * from users
        where username = ${username}`);
    return Boolean(user);
}

// Clear the current user auth-token
async function clearUserAuthToken(auth_token) {
    const db = await dbPromise;
    await db.run(SQL`
        UPDATE users
        SET auth_token = NULL
        WHERE auth_token = ${auth_token}`);
}


// Gets the user with the given id from the database.
async function retrieveUserById(id) {
    const db = await dbPromise;

    const user = await db.get(SQL`
        select * from users
        where id = ${id}`);

    return user;
}


// Gets the user with the given username and password from the database.
// If there is no such user, undefined will be returned.
async function retrieveUserWithCredentials(username, password) {
    const db = await dbPromise;
    const user = await db.get(SQL`
        select * from users
        where username = ${username}`);
    if (user) {
        const match = await bcrypt.compare(password, user.hashed_password);
        if (match) {
            return user;
        }
    }
    return null;
}


// Gets the user with the given authToken from the database.
async function retrieveUserWithAuthToken(authToken) {
    const db = await dbPromise;

    const user = await db.get(SQL`
        select * from users
        where auth_token = ${authToken}`);
    return user;
}


// Gets the user with the given username from the database.
async function retrieveUserByUsername(username) {
    const db = await dbPromise;

    const user = await db.get(SQL`
        select * from users
        where username = ${username}`);
    return user;
}

// Update the authToken to the current user
async function updateUser(user) {
    const db = await dbPromise;
    await db.run(SQL`
        UPDATE users
        SET auth_token = ${user.authToken}
        where id = ${user.id}`);
}


// Deletes the user with the given id from the database.
async function deleteUser(id) {
    const db = await dbPromise;
    await db.run(SQL`
        delete from users
        where id = ${id}`);
}

// Hash the password with salt and return the hashed password
async function hashpassword(password) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

// Change the password with new hashed_password
async function changePassword(userId, hashed_password) {
    const db = await dbPromise;
    await db.run(SQL`
        UPDATE users
        SET hashed_password = ${hashed_password}
        where id = ${userId}`);
}

// Retrieve the user data and update user information, to allowd user change their portfolio.
async function modifyUserByUsername(userData) {
    const { originalName, username, lastName, firstName, birthday, description, avatar } = userData;

    const db = await dbPromise;
    const result = await db.run(SQL`
      UPDATE users
      SET username = ${username},
          first_name = ${firstName},
          last_name = ${lastName},
          birthday = ${birthday},
          description = ${description},
          avatar = ${avatar}
      WHERE username = ${originalName}
    `);
    return result;
}

// We will use those routes in our admin system after we finished the prokect
//*********************************************************************************************
async function checkAdmin(user_id) {
    const db = await dbPromise;
    const admin = await db.get(SQL`
    select * from admins
    where user_id = ${user_id}
    `);
    return admin;
}

// Get total articles count of each users
async function getUserAndArticleCount() {
    const db = await dbPromise;
    const users = await db.all(SQL`
        SELECT users.*, COUNT(articles.id) as articleCount
        FROM users
        LEFT JOIN articles ON users.id = articles.user_id
        GROUP BY users.id
    `);
    return users;
}
//*********************************************************************************************

// Export functions.
module.exports = {
    createUser,
    retrieveUserById,
    retrieveUserWithCredentials,
    retrieveUserWithAuthToken,
    retrieveUserByUsername,
    updateUser,
    deleteUser,
    retriveUsernameValidation,
    hashpassword,
    clearUserAuthToken,
    changePassword,
    modifyUserByUsername,
    checkAdmin,
    getUserAndArticleCount
};
