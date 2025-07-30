const mongoose = require("mongoose");

const favoriteSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  homeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Home",
  },
});

module.exports = mongoose.model("Favorite", favoriteSchema);
