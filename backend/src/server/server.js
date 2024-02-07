module.exports = () => {
  const routes = require("./api/routes/router.js")
  const express = require("express");
  const mongoose = require("mongoose");
  const cors = require('cors');
  const config = require('../../config')
  const swaggerUi = require('swagger-ui-express');
  let swaggerDocument = require('./swagger.json');
  const log = require('../utils/logger').app(module)

  const dmmServer = express();

  swaggerDocument.host = swaggerDocument.host + (config.httpPort || 5500)

  dmmServer.use(cors());
  dmmServer.use(express.json());
  dmmServer.use(express.urlencoded({ extended: false }));
  dmmServer.use("/api", routes);
  dmmServer.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
  );

  function init() {
    mongoose
      .connect(config.mongo, { useNewUrlParser: true })
      .then(() => {
        dmmServer.listen(config.httpPort || 5500, () => {
          log.info("Server has started!");
          log.info("listening on port: " + config.httpPort || 5500);

          /*if (config.writers.filter(writer => writer == "minioWriter")[0]) {
            const minioWriter = require('../writers/minioWriter')
            log.info("Minio connection enabled")
          }*/
        });

      })
  }

  init()
}
