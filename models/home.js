const { getDB } = require("../utils/databaseutil");
const { ObjectId } = require("mongodb");
class Home {
  constructor(
    _id,
    houseName,
    numberOfNights,
    pricePerDay,
    facilities,
    numberOfRooms,
    location,
    houseImages
  ) {
    this._id = _id;
    this.houseName = houseName;
    this.numberOfNights = numberOfNights;
    this.pricePerDay = pricePerDay;
    this.facilities = facilities;
    this.numberOfRooms = numberOfRooms;
    this.location = location;
    this.houseImages = houseImages;
    if (!_id) {
      console.log("Home created with ID:", _id);
      this._id = _id; // Automatically generate an ID if not provided
    }
  }

  // Insert or Update a Home
  save() {
    const db = getDB();
    return db.collection("homes").insertOne(this);
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
    return db
      .collection("homes")
      .find({ _id: new ObjectId(String(homeId)) })
      .next();
  }

  // Delete home by ID
  static deleteById(homeId) {}

  // Update home by ID (static method)
  static updateById(id, updatedHome) {}
}

module.exports = Home;
