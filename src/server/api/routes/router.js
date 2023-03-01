const express = require("express")
const {insertMap, insertSource, insertDataModel, mapData} = require("../controllers/controller.js")
const router = express.Router()

router.post(encodeURI("/map"), mapData)
router.post(encodeURI("/add/map"), insertMap)
router.post(encodeURI("/add/source"), insertSource)
router.post(encodeURI("/add/dataModel"), insertDataModel)

module.exports = router
