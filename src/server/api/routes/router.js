const express = require("express")
const {getInfo, mapData} = require("../controllers/controller.js")
const router = express.Router()

router.post(encodeURI("/map"), mapData)

module.exports = router
