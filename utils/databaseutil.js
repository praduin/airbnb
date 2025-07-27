// utils/databaseutil.js
const mongo = require("mongodb");
const mongoClient = mongo.MongoClient;

const url =
  "mongodb+srv://praduin:root@completeairbnb.ki07pmq.mongodb.net/airbnb?retryWrites=true&w=majority&appName=completeairbnb";

const mongoConnect = (callback) => {
  mongoClient
    .connect(url)
    .then((client) => {
      console.log("Connected to MongoDB");
      callback(client);
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB", err);
    });
};

module.exports = {
  mongoConnect,
};
