const mongoose = require("mongoose");

const dataModel = mongoose.Schema({
  name: String,
  //id: String,
  mapRef : {},
  dataModel: {}
}, { versionKey: false });

module.exports = mongoose.model("dataModel", dataModel);