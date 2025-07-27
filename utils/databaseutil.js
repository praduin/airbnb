// utils/databaseutil.js
const mongo = require("mongodb");
const mongoClient = mongo.MongoClient;

const url =
  "mongodb+srv://praduin:root@completeairbnb.ki07pmq.mongodb.net/airbnb?retryWrites=true&w=majority&appName=completeairbnb";

let _db;

const mongoConnect = (callback) => {
  mongoClient
    .connect(url)
    .then((client) => {
      console.log("Connected to MongoDB");
      callback(client);
      _db = client.db("airbnb");
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB", err);
    });
};

const getDB = () => {
  if (!_db) {
    throw new Error("No database found!");
  }
  return _db;
};

exports.mongoConnect = mongoConnect;
exports.getDB = getDB;
