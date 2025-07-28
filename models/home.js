const { getDB } = require("../utils/databaseutil");
const { ObjectId } = require("mongodb");

class Home {
  constructor(
    id,
    houseName,
    numberOfNights,
    pricePerDay,
    facilities,
    numberOfRooms,
    location,
    houseImages
  ) {
    this._id = id ? new ObjectId(id) : null;
    this.houseName = houseName;
    this.numberOfNights = numberOfNights;
    this.pricePerDay = pricePerDay;
    this.facilities = facilities;
    this.numberOfRooms = numberOfRooms;
    this.location = location;
    this.houseImages = houseImages;
  }

  // Insert or Update a Home
  save() {
    const db = getDB();

    const homeData = {
      houseName: this.houseName,
      numberOfNights: this.numberOfNights,
      pricePerDay: this.pricePerDay,
      facilities: this.facilities,
      numberOfRooms: this.numberOfRooms,
      location: this.location,
      houseImages: this.houseImages,
    };

    if (this._id) {
      // Update existing home
      return db
        .collection("homes")
        .updateOne({ _id: this._id }, { $set: homeData });
    } else {
      // Insert new home
      return db.collection("homes").insertOne(homeData);
    }
  }

  // Fetch all homes
  static fetchAll() {
    const db = getDB();
    return db.collection("homes").find().toArray();
  }

  // Find home by ID
  static findById(homeId) {
    console.log("findById called with homeId:", homeId);
    const db = getDB();
    return db.collection("homes").findOne({ _id: new ObjectId(homeId) });
  }

  // Delete home by ID
  static deleteById(homeId) {
    console.log("deleteById called with homeId:", homeId);
    const db = getDB();
    return db.collection("homes").deleteOne({ _id: new ObjectId(homeId) });
  }
}

module.exports = Home;
