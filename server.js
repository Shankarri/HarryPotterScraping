
var express = require("express");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

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
        var articleTitleArray = [];
        var dbData = [];
        // db.Article.deleteMany({}, function (err, data) {
        $(".hub-item").each(function (index, element) {

            results.push({
                title: $(element).find(".hub-item__title").text(),
                link: $(element).find("a").attr("href"),
                imgURL: $(element).find(".img picture img").attr("data-src"),
                articleDate: $(element).find(".hub-item__date").text(),
                // saved : false
            });
            // articleTitleArray.push(results[index].title);
            if (index > 20) return false;
        });
        
        db.Article.find({})
            .then(function (dbData) {
                var newArticles =[];

                for (var resultIndex in results) 
                {
                    var checkDB = dbData.filter(function (obj) {
                        // console.log(obj.title + " === "+ results[resultIndex].title );
                        return (results[resultIndex].title == obj.title);
                    });
                    if(checkDB.length == 0)
                    {
                        newArticles.push(results[resultIndex]);
                    }
                }
                console.log("newArticles",newArticles);
                if(newArticles.length >0)
                {
                    db.Article.create(newArticles)
                    .then(function (dbArticle) {
                        console.log("Added new articles in db");
                    }).catch(function (err) { console.log(err);});
                }
            });
       res.json(results);
    }); 
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
     db.Article.find({}) 
    .then( function (articles) {
        articles.noteData = [];
        res.json(articles);
        
         // 
    });
});


app.get("/articles/notes/:id", function(req, res) {
    console.log("inside /articles/notes/:id");
   db.Article.findOne({_id: req.params.id}) 
      .populate("note")
      .then( article => res.json(article.note))
  });

app.post("/articles/notes/:id", function(req, res) {
    
    db.Note.create(req.body)
    // then find an article from the req.params.id
      .then( dbNote => db.Article.findOneAndUpdate(
              {_id:req.params.id},
              {$set:{note:dbNote._id}})    
      )
      .then(dbArticle => res.json(dbArticle))
      .catch( err => res.json(500, err))
    // and update it's "note" property with the _id of the new note
  
  });

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    db.Article.findOneAndUpdate(
        {_id:req.params.id},
        {$set:{saved:req.body.saved}})
        .then(dbArticle => res.json(dbArticle));

});

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
