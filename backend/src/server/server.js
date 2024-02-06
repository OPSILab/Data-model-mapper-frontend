module.exports = () => {
  const routes = require("./api/routes/router.js")
  const express = require("express");
  const mongoose = require("mongoose");
  const cors = require('cors');
  const config = require('../../config')
  const swaggerUi = require('swagger-ui-express');
  let swaggerDocument = require('./swagger.json');
  const log = require('../utils/logger').app(module)

  const app = express();
  const app2 = express();

  swaggerDocument.host = swaggerDocument.host + (config.httpPort || 5000)

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use("/api", routes);
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
  );

  app2.use(cors());
  app2.use(express.json());
  app2.use(express.urlencoded({ extended: false }));
  app2.use("", routes);

  function init() {
    mongoose
      .connect(config.mongo, { useNewUrlParser: true })
      .then(() => {
        app2.listen(5502, () => {
          log.info("Server has started!");
          log.info("listening on port: " + 5502);
         // console.debug("MINIO")
          //const minioWriter = require('../writers/minioWriter')

        });
        app.listen(config.httpPort || 5500, () => {
          log.info("Server has started!");
          log.info("listening on port: " + config.httpPort || 5500);
          console.debug("MINIO")
          const minioWriter = require('../writers/minioWriter')

        });
       
      })
  }

  init()
}
