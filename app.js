// Setup Express
const express = require("express");
const app = express();
const port = 3000;

// Setup Handlebars
const handlebars = require("express-handlebars");
app.engine(
  "handlebars",
  handlebars({
    defaultLayout: "main",
  })
);
app.set("view engine", "handlebars");

// Setup body-parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Setup cookie-parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Make the "public" folder available statically
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

// Use the middleware
app.use(require("./middleware/toaster-middleware.js"));
const { addUserToLocals } = require("./middleware/auth-middleware.js");
app.use(addUserToLocals);

// Setup routes
app.use(require("./routes/analysis-routes.js"));
app.use(require("./routes/account-routes.js"));
app.use(require("./routes/article-routes.js"));
app.use(require("./routes/edit-account-routes.js"));
app.use(require("./routes/edit-article-routes.js"));
app.use(require("./routes/homePage-routes.js"));
app.use(require("./routes/manage-subscription-routes.js"));
app.use(require("./routes/subscription-routes.js"));

// routes for Admins
app.use(require("./routes/api-routes.js"));

// Render to 404 handlebars.
app.get('/404', function (req, res) {
  res.status(404).render('404', { title: 'Not Found' });
});

// Catch all undefined routes or undefined page, redirect them to 404.
app.use(function (req, res, next) {
  res.redirect('/404');
});

// Start the server running.
app.listen(port, function () {
  console.log(`App listening on port ${port}! And welcome to the blog of Group Five!`);
});
