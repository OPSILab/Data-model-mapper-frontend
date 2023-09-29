const express = require("express")
const { getConfig, insertMap, dereferenceSchema, insertSource, insertDataModel, mapData, getMap, getSource, getDataModel, getMaps, getSources, getDataModels, modifyMap, modifySource, modifyDataModel, deleteMap, deleteSource, deleteDataModel, file } = require("../controllers/controller.js")
const router = express.Router()
const multer = require('multer');
const upload = multer();

router.post(encodeURI("/map/transform"), upload.none(), mapData)
router.post(encodeURI("/map/register"), upload.none(), insertMap)
router.post(encodeURI("/source"), upload.none(), insertSource)
router.post(encodeURI("/dataModel"), upload.none(), insertDataModel)
router.post(encodeURI("/dereferenceSchema"), upload.none(), dereferenceSchema)

router.get(encodeURI("/map"), getMap)
router.get(encodeURI("/config"), getConfig)
router.get(encodeURI("/source"), getSource)
router.get(encodeURI("/dataModel"), getDataModel)

router.get(encodeURI("/maps"), getMaps)
router.get(encodeURI("/sources"), getSources)
router.get(encodeURI("/dataModels"), getDataModels)

router.put(encodeURI("/map"), upload.none(), modifyMap)
router.put(encodeURI("/source"), upload.none(), modifySource)
router.put(encodeURI("/dataModel"), upload.none(), modifyDataModel)

router.delete(encodeURI("/map"), deleteMap)
router.delete(encodeURI("/source"), deleteSource)
router.delete(encodeURI("/dataModel"), deleteDataModel)

module.exports = router
