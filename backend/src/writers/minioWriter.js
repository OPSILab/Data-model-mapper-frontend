var Minio = require('minio')
let minioConfig = require('../../config').minioWriter
const { e, sleep } = require('../utils/common')
const Source = require("../server/api/models/source.js")
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

    let logCounterFlag
    while (!errorMessage && !resultMessage) {
      await sleep(1)
      if (!logCounterFlag) {
        logCounterFlag = true
        sleep(1000).then(resolve => {
          if (!errorMessage && !resultMessage)
            log.debug("waiting for creating bucket")
          logCounterFlag = false
        })
      }
    }
    if (errorMessage)
      throw errorMessage
    if (resultMessage)
      return resultMessage
    //})

  },

  subscribe(bucket) {
    minioClient.getBucketNotification(bucket, function (err, bucketNotificationConfig) {
      if (err) return console.log(err)
      console.log(bucketNotificationConfig)
    })
  },

  setNotifications(bucket) {

    var bucketNotification = new Minio.NotificationConfig()
    var arn = Minio.buildARN('aws', 'sqs', 'us-east-1', '1', 'webhook')
    var queue = new Minio.QueueConfig(arn)
    queue.addEvent(Minio.ObjectReducedRedundancyLostObject)
    queue.addEvent(Minio.ObjectCreatedAll)
    bucketNotification.add(queue)
    minioClient.setBucketNotification(bucket, bucketNotification, function (err) {
      if (err) return console.log(err)
      log.info('Success')
    })
  },

  getNotifications(bucketName) {
    const poller = minioClient.listenBucketNotification(bucketName, '', '', ['s3:ObjectCreated:*'])
    poller.on('notification', async (record) => {
      console.log('New object: %s/%s (size: %d)', record.s3.bucket.name, record.s3.object.key, record.s3.object.size)
      const newObject = await this.getObject(record.s3.bucket.name, record.s3.object.key)
      let jsonParsed
      try {
        jsonParsed = JSON.parse(newObject)
      }
      catch (error) {
        console.error(error)
      }

      let foundObject = (await Source.find({ name: record.s3.object.key }))[0]
      if (foundObject)
        await Source.findOneAndReplace({ name: record.s3.object.key },
          //format ? 
          {
            name: record.s3.object.key,
            source: jsonParsed ? jsonParsed : newObject,
            bucket: record.s3.bucket.name,
            from: "minio",
            timestamp: Date.now()
          }
          //: { name: record.s3.object.key, sourceCSV: newObject, bucket: record.s3.bucket.name, from: "minio", timestamp: new Number(Date.now()) }
        )
      else
        await Source.insertMany([
          //format ? 
          {
            name: record.s3.object.key,
            source: jsonParsed ? jsonParsed : newObject,
            bucket: record.s3.bucket.name,
            from: "minio",
            timestamp: Date.now()
          }
          //: { name: record.s3.object.key, sourceCSV: newObject, bucket: record.s3.bucket.name, from: "minio", timestamp: new Number(Date.now()) }
        ])
    })
    poller.on('error', (error) => {
      console.error(error)
      log.debug("Creating bucket")
      this.creteBucket(bucketName, minioConfig.location).then(message => {
        log.debug(message)
        this.getNotifications(bucketName)
      }
      )
    })
  },

  async listObjects(bucketName, prefix, recursive) {


    let resultMessage
    let errorMessage

    var data = []
    var stream = minioClient.listObjects(bucketName, '', true, { IncludeVersion: true })
    //var stream = minioClient.extensions.listObjectsV2WithMetadata(bucketName, '', true, '')
    stream.on('data', function (obj) {
      data.push(obj)
    })
    stream.on('end', function (obj) {
      if (!obj)
        log.info("ListObjects ended returning an empty object")
      else
        log.info("Found object " + JSON.stringify(obj))
      if (data[0])
        log.info(JSON.stringify(data))
      resultMessage = data
      //process.res.send(data)
    })
    stream.on('error', function (err) {
      console.error(err)
      errorMessage = err
    })

    let logCounterFlag
    while (!errorMessage && !resultMessage) {
      await sleep(1)
      if (!logCounterFlag) {
        logCounterFlag = true
        sleep(1000).then(resolve => {
          if (!errorMessage && !resultMessage)
            log.debug("waiting for list")
          logCounterFlag = false
        })
      }
    }
    if (errorMessage)
      throw errorMessage
    if (resultMessage)
      return resultMessage
  },

  async listBuckets() {
    return await minioClient.listBuckets()
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

    minioClient.putObject(bucketName, objectName, JSON.stringify(object), function (err, res) {
      if (err) {
        errorMessage = err
        return e(err)
      }
      log.info("Result : ")
      log.info(JSON.stringify(res))
      resultMessage = res
    })

    let logCounterFlag
    while (!errorMessage && !resultMessage) {
      await sleep(1)
      if (!logCounterFlag) {
        logCounterFlag = true
        sleep(1000).then(resolve => {
          if (!errorMessage && !resultMessage)
            log.debug("waiting for upload")
          logCounterFlag = false
        })
      }
    }
    if (errorMessage)
      throw errorMessage
    if (resultMessage)
      return resultMessage
    // })

  },

  async getObject(bucketName, objectName, format) {

    log.debug("Now getting object " + objectName + " in bucket " + bucketName)

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
        try {
          resultMessage = format == 'json' ? JSON.parse(objectData) : objectData
        }
        catch (error) {
          console.error(error)
          resultMessage = format == 'json' ? { data: objectData } : objectData
        }
      });

      dataStream.on('error', function (err) {
        log.info('Error reading object:')
        errorMessage = err
        e(err);
      });

    });

    let logCounterFlag
    while (!errorMessage && !resultMessage) {
      await sleep(1)
      if (!logCounterFlag) {
        logCounterFlag = true
        sleep(1000).then(resolve => {
          if (!errorMessage && !resultMessage)
            log.debug("waiting for object " + objectName + " in bucket " + bucketName)
          logCounterFlag = false
        })
      }
    }
    if (errorMessage)
      throw errorMessage
    if (resultMessage)
      return resultMessage
    //})
  }
}