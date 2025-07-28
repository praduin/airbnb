const { ObjectId } = require("mongodb");
const mongose = require("mongoose");
const Favorite = require("./favorite"); // Ensure this path is correct
const homeshema = mongose.Schema({
  houseName: { type: String, required: true },
  location: { type: String, required: true },
  numberOfRooms: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  numberOfNights: { type: Number, required: true },
  houseImages: { type: String, required: true },
  facilities: { type: String }, // ✅ Optional but useful
});

homeshema.pre("findOneAndDelete", async function (next) {
  const homeId = this.getQuery()["_id"];
  await Favorite.deleteMany({ homeId: homeId });
  next();
});

module.exports = mongose.model("Home", homeshema);

/*
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
  static find() {
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
*/

// module.exports = Home;
