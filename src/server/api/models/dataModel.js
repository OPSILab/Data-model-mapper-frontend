const mongoose = require("mongoose");

const dataModel = mongoose.Schema({
  name: String,
  dataModel: {}
}, { versionKey: false });

module.exports = mongoose.model("dataModel", dataModel);