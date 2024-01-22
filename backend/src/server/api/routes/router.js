const express = require("express")
const { getConfig, insertMap, dereferenceSchema, insertSource, insertDataModel, mapData, getMap, getSource, getDataModel, getMaps, getSources, getDataModels, modifyMap, modifySource, modifyDataModel, deleteMap, deleteSource, deleteDataModel, file } = require("../controllers/controller.js")
const router = express.Router()
const multer = require('multer');
const upload = multer();
const {auth} = require("../middlewares/auth.js")

router.post(encodeURI("/map/transform"), auth, upload.none(), mapData)
router.post(encodeURI("/map/register"), auth, upload.none(), insertMap)
router.post(encodeURI("/source"), auth, upload.none(), insertSource)
router.post(encodeURI("/dataModel"), auth, upload.none(), insertDataModel)
router.post(encodeURI("/dereferenceSchema"), auth, upload.none(), dereferenceSchema)

router.get(encodeURI("/map"), auth, getMap)
router.get(encodeURI("/config"), auth, getConfig)
router.get(encodeURI("/source"), auth, getSource)
router.get(encodeURI("/dataModel"), auth, getDataModel)

router.get(encodeURI("/maps"), auth, getMaps)
router.get(encodeURI("/sources"), auth, getSources)
router.get(encodeURI("/dataModels"), auth, getDataModels)

router.put(encodeURI("/map"), auth, upload.none(), modifyMap)
router.put(encodeURI("/source"), auth, upload.none(), modifySource)
router.put(encodeURI("/dataModel"), auth, upload.none(), modifyDataModel)

router.delete(encodeURI("/map"), auth, deleteMap)
router.delete(encodeURI("/source"), auth, deleteSource)
router.delete(encodeURI("/dataModel"), auth, deleteDataModel)

module.exports = router
