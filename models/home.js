const { ObjectId } = require("mongodb");
const mongose = require("mongoose");

const homeshema = mongose.Schema({
  houseName: { type: String, required: true },
  location: { type: String, required: true },
  numberOfRooms: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  numberOfNights: { type: Number, required: true },
  houseImages: { type: String, required: true },
  facilities: { type: String }, // ✅ Optional but useful
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdBy: {
    type: mongose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  createdBy: {
    type: mongose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

homeshema.pre("findOneAndDelete", async function (next) {
  const homeId = this.getQuery()["_id"];
  await Favorite.deleteMany({ homeId: homeId });
  next();
});

module.exports = mongose.model("Home", homeshema);
