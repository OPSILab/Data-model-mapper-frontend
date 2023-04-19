const mongoose = require("mongoose");

const map = mongoose.Schema({
  name: String,
  id: String,
  map: {},
  dataModel : {}
}, { versionKey: false });

module.exports = mongoose.model("map", map);