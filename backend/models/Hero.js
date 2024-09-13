const mongoose = require("mongoose");

const heroSchema = new mongoose.Schema({
  marvelId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  comics: { type: Number },
  stories: { type: Number },
  events: { type: Number },
  series: { type: Number },
  rarity: {
    type: String,
    enum: ["common", "uncommon", "rare", "epic", "legendary"],
    default: "common",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Hero", heroSchema);
