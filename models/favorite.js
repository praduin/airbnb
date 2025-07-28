const mongoose = require("mongoose");

const favoriteSchema = mongoose.Schema({
  homeId: {
    type: mongoose.Schema.Types.ObjectId, // Use ObjectId for homeId
    required: true,
    unique: true, // Refere
    // nce to the Home model
    ref: "Home",
  },
});

module.exports = mongoose.model("Favorite", favoriteSchema);
