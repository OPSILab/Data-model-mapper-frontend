var Minio = require('minio')
let minioConfig = require('../../config').minioWriter
const e = require('../utils/utils').e
let minioClient


module.exports = {

  file: "../../output/result.json",
  bucketName: "datamodelmapper",
  objectName: "test",

  createClient() {
    minioClient = new Minio.Client({
      endPoint: minioConfig.endPoint,
      port: minioConfig.port,
      useSSL: minioConfig.useSSL,
      accessKey: minioConfig.accessKey,
      secretKey: minioConfig.secretKey,
    })
  },

  creteBucket(name) {

    try {
      minioClient.makeBucket(name, 'eu', function (err) {
        if (err) return e(err)


        console.log('Bucket created successfully in "us-east-1".')
      })
    }
    catch (error) {
      e(error)
    }
  },

  fileUpload() {
    var metaData = {
      'Content-Type': 'application/octet-stream',
      'X-Amz-Meta-Testing': 1234,
      example: 5678,
    }

    try {
      minioClient.fPutObject(this.bucketName, this.objectName, this.file, metaData, function (err, etag) {
        console.log(etag?.response?.data || JSON.stringify(etag) || etag)
        if (err) return e(err)
        console.log('File uploaded successfully.')
      })
    }
    catch (error) {
      e(error)
    }
  },

  stringUpload(objectName, object) {
    var metaData = {
      'Content-Type': 'application/octet-stream',
      'X-Amz-Meta-Testing': 1234,
      example: 5678,
    }

    minioClient.putObject(this.bucketName, objectName, object, function (err, res) {
      if (err) return e(err)
      console.log("Result : ")
      console.log(res?.response?.data || JSON.stringify(res) || res)
    })
  },

  getObject(objectName) {

    minioClient.getObject(this.bucketName, objectName, function (err, dataStream) {
      if (err) {
        return e(err)
      }

      let objectData = '';
      dataStream.on('data', function (chunk) {
        objectData += chunk;
      });

      dataStream.on('end', function () {
        console.log('Object data:', objectData?.response?.data || JSON.stringify(objectData) || objectData);
      });

      dataStream.on('error', function (err) {
        console.log('Error reading object:')
        e(err);
      });
    });
  }
}

let minioWriter = require('./minioWriter.js')

try {
  minioWriter.createClient()
}
catch (error) {
  console.log("error")
  e(error)
}
try {
  minioWriter.creteBucket("datamodelmapper")
}
catch (error) {
  console.log("error")
  e(error)

}
try {
  minioWriter.stringUpload("test", "test")
}
catch (error) {
  console.log("error")
  e(error)
}
try {
  minioWriter.getObject("test")
}
catch (error) {
  console.log("error")
  e(error)

}