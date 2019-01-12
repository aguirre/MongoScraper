const express = require("express");
const router = express.Router();
const db = require("../models");
const request = require("request");
const cheerio = require("cheerio");

router.get("/scrape", (req, res) => {
  console.log("scrape complete");

  request("https://www.nytimes.com/section/us", (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const $ = cheerio.load(body);
      let count = 0;

      $("article").each(function(i, element) {
        let count = i;
        let result = {};

        result.title = $(element)
          .children("div")
          .children("h2")
          .children("a")
          .text()
          .trim();
        result.link =
          "https://nytimes.com" +
          $(element)
            .children("div")
            .children("h2")
            .children("a")
            .attr("href");
        result.summary = $(element)
          .children("div")
          .children("p")
          .text()
          .trim();

        console.log(result);
        if (result.title && result.link && result.summary) {
          db.Article.create(result)
            .then(function(dbArticle) {
              console.log(dbArticle);
              count++;
            })
            .catch(function(err) {
              return res.json(err);
            });
        }
      });

      res.redirect("/");
    } else if (error || response.statusCode != 200) {
      res.send("Error: Unable to obtain new articles");
    }
  });
});

router.get("/", (req, res) => {
  db.Article.find({})
    .then(function(dbArticle) {
      const retrievedArticles = dbArticle;
      let hbsObject;
      hbsObject = {
        articles: dbArticle
      };
      res.render("index", hbsObject);
    })
    .catch(function(err) {
      console.log(err);
      res.json(err);
    });
});

module.exports = router;
