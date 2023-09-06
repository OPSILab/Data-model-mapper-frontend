const express = require("express")
const { getConfig, insertMap, insertSource, insertDataModel, mapData, getMap, getSource, getDataModel, getMaps, getSources, getDataModels, modifyMap, modifySource, modifyDataModel, deleteMap, deleteSource, deleteDataModel } = require("../controllers/controller.js")
const router = express.Router()

router.post(encodeURI("/map/transform"), mapData)
router.post(encodeURI("/map/register"), insertMap)
router.post(encodeURI("/source"), insertSource)
router.post(encodeURI("/dataModel"), insertDataModel)

router.get(encodeURI("/map"), getMap)
router.get(encodeURI("/config"), getConfig)
router.get(encodeURI("/source"), getSource)
router.get(encodeURI("/dataModel"), getDataModel)

router.get(encodeURI("/maps"), getMaps)
router.get(encodeURI("/sources"), getSources)
router.get(encodeURI("/dataModels"), getDataModels)

router.put(encodeURI("/map"), modifyMap)
router.put(encodeURI("/source"), modifySource)
router.put(encodeURI("/dataModel"), modifyDataModel)

router.delete(encodeURI("/map/:id"), deleteMap)
router.delete(encodeURI("/source"), deleteSource)
router.delete(encodeURI("/dataModel"), deleteDataModel)

module.exports = router
