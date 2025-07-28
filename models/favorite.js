const { getDB } = require("../utils/databaseutil");
const { ObjectId } = require("mongodb");

module.exports = class Favorite {
  constructor(homeId) {
    if (!ObjectId.isValid(homeId)) {
      throw new Error("Invalid homeId format for ObjectId");
    }
    this.homeId = new ObjectId(homeId);
  }

  // Instance method to save favorite with duplicate check
  save() {
    const db = getDB();

    return db
      .collection("favorites")
      .findOne({ homeId: this.homeId })
      .then((existing) => {
        if (existing) {
          // Already in favorites — skip inserting
          console.log("Home already in favorites.");
          return null; // Or you could throw an error if you want to notify the controller
        }

        // Insert new favorite
        return db.collection("favorites").insertOne({ homeId: this.homeId });
      });
  }

  // Static method to fetch all favorites
  static getFavorite() {
    const db = getDB();
    return db.collection("favorites").find().toArray();
  }

  // Static method to remove a favorite by homeId
  static removeFromFavorite(delHomeId) {
    const db = getDB();

    if (!ObjectId.isValid(delHomeId)) {
      throw new Error("Invalid ObjectId for deletion");
    }

    const homeObjectId = new ObjectId(delHomeId);
    return db.collection("favorites").deleteOne({ homeId: homeObjectId });
  }
};
