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

  function init() {
    mongoose
      .connect(config.mongo, { useNewUrlParser: true })
      .then(() => {
        app.listen(config.httpPort || 5000, () => {
          log.info("Server has started!");
          log.info("listening on port: " + config.httpPort || 5000);

        });
      })
  }

  init()
}
