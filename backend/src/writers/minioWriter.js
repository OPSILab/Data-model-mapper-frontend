var Minio = require('minio')
let minioConfig = require('../../config').minioWriter
let minioClient
let a = 0

function e(error) {
  let str = ""
  var util = require('util')
  for (let key in error) {
    //console.debug("{\n", key, " : ", response[key], "\n},\n")
    try {
      str = str.concat("{\n", '"', key, '"', " : ", JSON.stringify(error[key]), "\n},\n")
    }
    catch (error) {
      //console.error(error.message)
      str = str.concat("{\n", '"', key, '"', " : ", util.inspect(error[key]), "\n},\n")
      console.debug("corrected")
    }
  }

  var fs = require('fs');

  fs.writeFile("D:\\log" + JSON.stringify(a) + ".json", "[" + str.substring(0, str.length - 1) + "]", function (err) {
    if (err) throw err;
    console.debug('Log is created successfully.');
  })

  a++
}

module.exports = {

  file: "../../output/result.json",
  bucketName: "datamodelmapper",
  objectName: "test",

  // Instantiate the minio client with the endpoint
  // and access keys as shown below.
  createClient() {
    minioClient = new Minio.Client({
      endPoint: "localhost",//.split("/")[0],
      //endPoint: minioConfig.endPoint,//.split("/")[0],
      //path: "/minio/",//minioConfig.endPoint.split("/")[1] + "/",
      //pathStyle: true,
      port: 5502,//,80,
      useSSL: false, //minioConfig.useSSL,
      accessKey: minioConfig.accessKey,
      secretKey: minioConfig.secretKey,
    })
  },

  // File that needs to be uploaded.

  // Make a bucket called europetrip.

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
      // Using fPutObject API upload your file to the bucket europetrip.
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

      // Manipola i dati del flusso come necessario
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
//minioWriter.getObject("photos-europe.tar")
try {
  minioWriter.getObject("test")
}
catch (error) {
  console.log("error")
  e(error)

}
//minioWriter.fileUpload()