const express = require("express");
const bodyParser = require("body-parser");
const NewsAPI = require("newsapi");
const newsapi = new NewsAPI("b74d7bc36bb7449b8e3f85210dc17061");
const server = new express();
const fs = require("fs");

server.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
server.use(bodyParser.json());

//POSTMAN => GET METHOD =>
//localhost:3000/newsapi?q=tesla&from=2021-02-02&sortBy=publishedAt
server.get("/newsapi", function (req, res) {
  const query = req.query.query;
  newsapi.v2
    .everything({
      q: query || "tesla",
      sources:
        "abc-news, bbc-news, bbc-sport, business-insider, business-insider-uk, cnbc, cnn, crypto-coins-news, daily-mail, entertainment-weekly, espn, espn-cric-info, financial-times, fortune, fox-news, mtv-news, national-geographic, news24, techcrunch, the-hindu, the-new-york-times, the-times-of-india, usa-today",
    })
    .then(
      (response) => {
        console.log(
          `Shown ${response.articles.length} articles from ${response.totalResults}`
        );
        response.query = req.query;
        if (response.status === "ok" && response.articles.length > 0) {
          const articles = response.articles.map((article) => {
            return {
              article: {
                author: article.author,
                title: article.title,
                description: article.description,
                url: article.url,
                urlToImage: article.urlToImage,
                publishedAt: article.publishedAt,
                query: response.query,
              },
            };
          });
          fs.writeFile("data.json", JSON.stringify(articles), (err) => {
            if (err) throw err;
            console.log("Data saved");
          });
          return res.json(articles);
        } else {
          return res.json({ message: `No articles for ${query}.` });
        }
      },
      (error) => {
        return res.json({ message: `${query} - Got this error: ${error}.` });
      }
    );
});

const port = process.env.PORT || 3000;
server.listen(port, function () {
  console.log(`Server is up and running on port ${port}...`);
});
