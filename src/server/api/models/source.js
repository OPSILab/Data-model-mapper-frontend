const mongoose = require("mongoose");

const source = mongoose.Schema({
  name: String,
  source: {},
  sourceCSV: String
}, { versionKey: false });

module.exports = mongoose.model("source", source);