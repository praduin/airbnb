const fs = require("fs");
const path = require("path");
const rootDir = require("../utils/pathUtil"); // Your root directory utility

const favoriteDataPath = path.join(rootDir, "data", "favorite.json");

module.exports = class Favorite {
  static addToFavorite(homeId, callback) {
    Favorite.getFavorite((favoriteList) => {
      if (favoriteList.includes(homeId)) {
        console.log("Home is already marked as favorite");
        return callback(null); // No error, just already present
      }

      favoriteList.push(homeId);

      fs.writeFile(favoriteDataPath, JSON.stringify(favoriteList), (err) => {
        if (err) {
          console.error("Error writing to favorite.json:", err);
          return callback(err); // ✅ only one callback
        }
        callback(null);
      });
    });
  }

  static getFavorite(callback) {
    fs.readFile(favoriteDataPath, (err, data) => {
      if (err || !data.length) {
        return callback([]);
      }
      callback(JSON.parse(data));
    });
  }

  static removeFromFavorite(homeId, callback) {
    Favorite.getFavorite((favoriteList) => {
      const updatedList = favoriteList.filter((id) => id !== homeId);

      fs.writeFile(favoriteDataPath, JSON.stringify(updatedList), (err) => {
        if (err) {
          console.error("Error removing from favorite.json:", err);
          return callback(err);
        }
        callback(null);
      });
    });
  }
};
