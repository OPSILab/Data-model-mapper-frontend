const mongoose = require("mongoose");

const source = mongoose.Schema({
  name: String,
  id: String,
  source: {},
  sourceCSV: String
}, { versionKey: false });

module.exports = mongoose.model("source", source);