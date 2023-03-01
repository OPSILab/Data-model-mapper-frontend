const mongoose = require("mongoose");

const map = mongoose.Schema({
  name: String,
  map: {}
}, { versionKey: false });

module.exports = mongoose.model("map", map);