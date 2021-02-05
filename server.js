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
  const query = req.query;
  let localData = [];
  if (query !== null || query !== undefined) {
    fs.readFile("data.json", (err, data) => {
      if (err) throw err;
      let results = JSON.parse(data);
      for (let i = 0; i < results.length; i++) {
        if (
          JSON.stringify(results[i].article.query) === JSON.stringify(query)
        ) {
          localData.push(results[i]);
        }
      }
      if (localData.length) {
        console.log("Data from saved local file data.json:", localData);
        //res.json(localData);
        let responseToSend = {
          messages: [
            { "Data from saved local file data.json:": localData },
            {
              message: `Shown ${localData.length} articles`,
            },
          ],
        };
        return res.json(responseToSend);
      } else {
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
                  console.log("Data saved succesfully to local data.json");
                });
                console.log("Data from new request to newsapi", articles);
                let responseToSend = {
                  messages: [
                    { "Data from new request to newsapi": articles },
                    {
                      message: `Shown ${response.articles.length} articles from ${response.totalResults}`,
                    },
                  ],
                };
                return res.json(responseToSend);
                //return res.json(articles);
              } else {
                return res.json({ message: `No articles for ${query}.` });
              }
            },
            (error) => {
              console.log(`${query} - finished with error: ${error}.`);
              return res.json({
                message: `${query} - finished with error: ${error}.`,
              });
            }
          );
      }
    });
  } else {
    console.log(`No data for ${req.query}`);
    res.json({ message: `No data for ${req.query}` });
  }
});

const port = process.env.PORT || 3000;
server.listen(port, function () {
  console.log(`Server is up and running on port ${port}...`);
});
