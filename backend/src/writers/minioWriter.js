var Minio = require('minio')
let minioConfig = require('../../config').minioWriter
const e = require('../utils/utils').e
const utils = require('../utils/utils')
const log = require('../utils/logger').app(module);

let minioClient = new Minio.Client({
  endPoint: minioConfig.endPoint,
  port: minioConfig.port,
  useSSL: minioConfig.useSSL,
  accessKey: minioConfig.accessKey,
  secretKey: minioConfig.secretKey,
})


module.exports = {

  async creteBucket(name, location) {

    let resultMessage
    let errorMessage

    minioClient.makeBucket(name, location, function (err) {
      if (err) {
        errorMessage = err;
        return e(err)
      }
      resultMessage = 'Bucket created successfully in ' + location + '.'
      log.info(resultMessage)
      return resultMessage
    })

    while (!errorMessage && !resultMessage)
      await utils.sleep(50)
    if (errorMessage)
      throw errorMessage
    return resultMessage
  },

  fileUpload(bucketName, objectName) {
    var metaData = {
      'Content-Type': 'application/octet-stream',
      'X-Amz-Meta-Testing': 1234,
      example: 5678,
    }

    try {
      minioClient.fPutObject(bucketName, objectName, minioConfig.defaultFileInput, metaData, function (err, etag) {
        log.info(etag)
        if (err) return e(err)
        log.info('File uploaded successfully.')
      })
    }
    catch (error) {
      e(error)
    }
  },

  async stringUpload(bucketName, objectName, object) {

    let resultMessage
    let errorMessage

    var metaData = {
      'Content-Type': 'application/octet-stream',
      'X-Amz-Meta-Testing': 1234,
      example: 5678,
    }

    minioClient.putObject(bucketName, objectName, JSON.stringify(object), function (err, res) {
      if (err) {
        errorMessage = err
        return e(err)
      }
      log.info("Result : ")
      log.info(res)
      resultMessage = res
    })

    while (!errorMessage && !resultMessage)
      await utils.sleep(50)
    if (errorMessage)
      throw errorMessage
    return resultMessage
  },

  async getObject(bucketName, objectName) {

    let resultMessage
    let errorMessage

    minioClient.getObject(bucketName, objectName, function (err, dataStream) {
      if (err) {
        errorMessage = err 
        return e(err)
      }

      let objectData = '';
      dataStream.on('data', function (chunk) {
        objectData += chunk;
      });

      dataStream.on('end', function () {
        log.info('Object data: ', objectData);
        resultMessage = JSON.parse(objectData)
      });

      dataStream.on('error', function (err) {
        log.info('Error reading object:')
        errorMessage = err 
        e(err);
      });

    });

    while (!errorMessage && !resultMessage)
      await utils.sleep(50)
    if (errorMessage)
      throw errorMessage
    return resultMessage
  }
}