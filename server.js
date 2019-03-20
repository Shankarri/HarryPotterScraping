
var express = require("express");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
// app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/harryPotterScraper", { useNewUrlParser: true });

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {

    axios.get("https://www.pottermore.com/news").then(function (response) {

        var $ = cheerio.load(response.data);

        var results = [];

        // db.Article.deleteMany({}, function (err, data) {
            $(".hub-item").each(function (i, element) {

               results.push({
                    title: $(element).find(".hub-item__title").text(),
                    link : $(element).find("a").attr("href"),
                    imgURL :  $(element).find(".img picture img").attr("data-src"),
                    articleDate : $(element).find(".hub-item__date").text(),
                    // saved : false
                });
                if (i>=19) return false;
            });
            // console.log(results);

            db.Article.create(results).then(function(dbArticle) {
              // View the added result in the console
              console.log(dbArticle);
            })
            .catch(function(err) {
              // If an error occurred, log it
              console.log(err);
            });
        // });
        // Send a message to the client
         res.json(results);
    });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    // TODO: Finish the route so it grabs all of the articles
    db.Article.find().then(function (error, doc) {
        if (error) res.json(error);

        console.log(doc);
        res.json(doc);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
    // TODO
    // ====
    // Finish the route so it finds one article using the req.params.id,
    // and run the populate method with "note",
    // then responds with the article with the note included
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    // TODO
    // ====
    // save the new note that gets posted to the Notes collection
    // then find an article from the req.params.id
    // and update it's "note" property with the _id of the new note
});

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
