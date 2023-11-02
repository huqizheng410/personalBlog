const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require("fs");
const articleDao = require("../modules/article-dao.js");
const userDao = require("../modules/users-dao.js");
const { verifyAuthenticated } = require("../middleware/auth-middleware.js");
const subscriptionDao = require("../modules/subscription-dao.js");

// Create Multer middleware and specify file upload limits and storage configuration
const upload = multer({
    dest: path.join(__dirname, "temp"),
    limits: { fileSize: 2 * 1024 * 1024 }
});

// Create if the current user has authority to edit the article, or create new article
router.get("/edit_create_article", verifyAuthenticated, async function (req, res) {
    const article_id = req.query.id;
    const authToken = req.cookies.authToken;
    if (article_id) {
        const article = await articleDao.retriveArticleById(article_id);
        const writerId = article.user_id;
        const imageurl = await articleDao.retriveImageByArticleId(article_id);
        const isValid = await articleDao.verifyArticleEditAuthenticated(authToken, writerId)
        if (isValid) {
            res.locals.article = article;
            res.locals.image = imageurl;
        }
        else {
            res.redirect(`/article/${article_id}`)
        }
    }
    res.render("edit_post_article");

});

// Receieve the image if possible, and store the edit article in the database
router.post("/post_article", upload.single("imageFile"), verifyAuthenticated, async function (req, res) {
    //modify the title and the content
    const title = req.body.article_title;

    const currentDatea = new Date();
    const create_date = currentDatea.toISOString();

    const article_content = req.body.article_content;

    const user = res.locals.user;
    const user_id = user.id;

    const articleTobeCreate = {
        title: title,
        create_date: create_date,
        content: article_content,
        user_id: user_id
    };

    const localArticleID = req.body.article_id;
    const articleTobeModify = {
        title: title,
        content: article_content,
        id: localArticleID
    };

    //modify the image upload
    const fileInfo = req.file;
    if (localArticleID) {
        await articleDao.updateArticle(articleTobeModify);
        if (fileInfo) {
            const url = await storeImage(fileInfo);
            await articleDao.insertImageData(url, localArticleID);
        };
        res.redirect(`/article/${localArticleID}`);
    } else {
        const article = await articleDao.createArticle(articleTobeCreate);
        if (fileInfo) {
            const url = await storeImage(fileInfo);
            await articleDao.insertImageData(url, article.id);
        };
        await subscriptionDao.createNotificationInNewArticle(article.user_id, article.id);
        res.redirect(`/article/${article.id}`);
    }

});

// Delete the article
router.get("/delete_article", verifyAuthenticated, async function (req, res) {
    const deleteArticleId = req.query.id;
    const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);
    const article = await articleDao.retriveArticleById(deleteArticleId);
    if (article.user_id == user.id) {
        await articleDao.deleteArticleByArticleId(deleteArticleId);
        res.redirect(`/`);
    } else {
        res.redirect(`/login`);
    };
});

// Store the image into article-image
function storeImage(fileInfo) {
    return new Promise((resolve, reject) => {
        const oldFileName = fileInfo.path;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const newPath = uniqueSuffix + fileInfo.originalname;
        const newFileName = `./public/article-image/${newPath}`;
        const url = `/article-image/${newPath}`;

        fs.rename(oldFileName, newFileName, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(url);
            }
        });
    });
}


module.exports = router;