var Minio = require('minio')
let minioConfig = require('../../config').minioWriter
const e = require('../utils/utils').e
const utils = require('../utils/utils')
const log = require('../utils/logger').app(module);
//const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

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
      await utils.sleep(1)
    if (errorMessage)
      throw errorMessage
    if (resultMessage)
      return resultMessage
    //})

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
      console.log(obj)
      console.log(data)
      resultMessage = data
      //process.res.send(data)
    })
    stream.on('error', function (err) {
      console.log(err)
      errorMessage = err
    })

    while (!errorMessage && !resultMessage)
      await utils.sleep(1)
    if (errorMessage)
      throw errorMessage
    if (resultMessage)
      return resultMessage


    /*
    if (isMainThread) {
      const worker = new Worker(__filename, {
        workerData: { input: 'example input data' }
      });
      worker.on('message', (message) => {
        console.log('Il worker ha inviato:', message);
        worker.terminate();
        return message
      });
      worker.on('error', (error) => {
        console.error('Errore nel worker:', error);
        throw error
      });
      worker.on('exit', (code) => {
        if (code !== 0) {
          console.error('Il worker si è chiuso con il codice di uscita:', code);
        }
        return code
      });
    } else {
      const inputData = workerData.input;
      //const result = performHeavyTask(inputData);
      var data = []
      var stream = minioClient.listObjects(bucketName, '', true, { IncludeVersion: true })
      //var stream = minioClient.extensions.listObjectsV2WithMetadata(bucketName, '', true, '')
      stream.on('data', function (obj) {
        data.push(obj)
      })
      stream.on('end', function (obj) {
        console.log(obj)
        console.log(data)
        parentPort.postMessage(data);
      })
      stream.on('error', function (err) {
        console.log(err)
        parentPort.postMessage(err);
      })

    }

    */

    /*
    function performHeavyTask(data) {
      const start = Date.now();
      while (Date.now() - start < 1) { }
      return `Elaborazione completata su "${data}"`;
    }*/





    //})

  },

  async listBuckets() {
    //const buckets = await minioClient.listBuckets()
    //console.log('Success', buckets)
    //return buckets
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
      await utils.sleep(1)
    if (errorMessage)
      throw errorMessage
    if (resultMessage)
      return resultMessage
    // })

  },

  async getObject(bucketName, objectName, format) {

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

    while (!errorMessage && !resultMessage)
      await utils.sleep(1)
    if (errorMessage)
      throw errorMessage
    if (resultMessage)
      return resultMessage
    //})


  }
}