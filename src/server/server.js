module.exports = () => {
  const routes = require("./api/routes/router.js")
  const express = require("express");
  const cors = require('cors');
  const config = require ('../../config')

  const app = express();


  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use("/api", routes);

  function init() {

    app.listen(config.httpPort || 5000, () => {
      console.log("Server has started!");
      console.log("listening on port: " + config.httpPort || 5000);

    });
  }

  init()
}
