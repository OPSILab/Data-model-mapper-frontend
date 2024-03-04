const express = require("express")
const controller = require("../controllers/controller.js")
const router = express.Router()
const multer = require('multer');
const upload = multer();
const {auth} = require("../middlewares/auth.js")

router.post(encodeURI("/map/transform"), auth, upload.none(), controller.mapData)
router.post(encodeURI("/map/register"), auth, upload.none(), controller.insertMap)
router.post(encodeURI("/source"), auth, upload.none(), controller.insertSource)
router.post(encodeURI("/dataModel"), auth, upload.none(), controller.insertDataModel)
router.post(encodeURI("/dereferenceSchema"), auth, upload.none(), controller.dereferenceSchema)
router.post(encodeURI("/minio/createBucket/:bucketName"), auth, upload.none(), controller.minioCreateBucket)
router.post(encodeURI("/minio/insertObject/:bucketName/:objectName"), auth, upload.none(), controller.minioInsertObject)

router.get(encodeURI("/map"), auth, controller.getMap)
router.get(encodeURI("/config"), auth, controller.getConfig)
router.get(encodeURI("/source"), auth, controller.getSource)
router.get(encodeURI("/dataModel"), auth, controller.getDataModel)
router.get(encodeURI("/minio/getObject/:bucketName/:objectName"), auth, controller.minioGetObject)
router.get(encodeURI("/minio/listObjects/:bucketName"), auth, controller.minioListObjects)
router.get(encodeURI("/minio/listObjects"), auth, controller.minioListObjects)
router.get(encodeURI("/minio/getObjects/:bucketName"), auth, controller.getSourcesFromMinio)
router.get(encodeURI("/minio/getObjects"), auth, controller.getSourcesFromMinio)
router.get(encodeURI("/minio/getBuckets"), auth, controller.minioGetBuckets)
router.get(encodeURI("/minio/subscribe/:bucketName"), auth, controller.minioSubscribe)
router.get(encodeURI("/maps"), auth, controller.getMaps)
router.get(encodeURI("/sources"), auth, controller.getSources)
router.get(encodeURI("/sources/db"), auth, controller.getSourcesFromDB)
router.get(encodeURI("/sources/minio"), auth, controller.getSourcesFromMinio)
router.get(encodeURI("/dataModels"), auth, controller.getDataModels)
router.get(encodeURI("/mockGetUser"), controller.mockGetUser)
router.get(encodeURI("/bearer"), controller.getToken)

router.put(encodeURI("/map"), auth, upload.none(), controller.modifyMap)
router.put(encodeURI("/source"), auth, upload.none(), controller.modifySource)
router.put(encodeURI("/dataModel"), auth, upload.none(), controller.modifyDataModel)

router.delete(encodeURI("/map"), auth, controller.deleteMap)
router.delete(encodeURI("/source"), auth, controller.deleteSource)
router.delete(encodeURI("/dataModel"), auth, controller.deleteDataModel)

module.exports = router
