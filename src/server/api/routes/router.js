const express = require("express")
const {insertMap, insertSource, insertDataModel, mapData} = require("../controllers/controller.js")
const router = express.Router()

router.post(encodeURI("/mapper"), mapData)
router.post(encodeURI("/map"), insertMap)
router.post(encodeURI("/source"), insertSource)
router.post(encodeURI("/dataModel"), insertDataModel)

module.exports = router
