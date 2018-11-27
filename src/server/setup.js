
const process = require('../utils/process');
const log = require('../utils/logger').app;
const config = require('../../config');
const utils = require('../utils/utils');

module.exports = () => {

    const http = require('http');

    const bodyParser = require('body-parser');
    const express = require('express');
    var multer = require('multer');
    var upload = multer({ dest: 'uploads/' });
    const _ = require('lodash');

    const app = express();
    const port = config.httpPort || 8080;

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    const setAuthHeaders = (hdrs) => {
        if (_.has(hdrs, 'authorization')) {
            process.env.OAUTH_TOKEN = hdrs.authorization;
        }
        if (_.has(hdrs, 'x-auth-token')) {
            process.env.PAUTH_TOKEN = hdrs['x-auth-token'];
        }
    };


    log.info("Initializing Mapper in Server Mode");
    app.use((req, res, next) => {
        setAuthHeaders(req.headers);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
        next();
    });


    app.post('/api/map', upload.fields([{ name: 'mapFile', maxCount: 1 }, { name: 'sourceData', maxCount: 1 }]), async (req, res) => {

        var sourceData = undefined;
        var sourceDataType = undefined;

        if (req.files && req.files['sourceData']) {

            sourceData = req.files['sourceData'][0];

        } else if (req.body && req.body.sourceData) {

            if (!req.body.sourceDataType) {
                return res.status(400).send({
                    error: "SourceDataTypeNotProvided",
                    errorMessage: "The Source Data Type (extension) was not provided"
                });
            }
            sourceData = req.body.sourceData;

        } else {

            return res.status(400).send({
                error: "SourceDataNotProvided",
                errorMessage: "The Source data (as file, url/path, or directly as string), was not provided"

            });
        }


        if (!req.body || !req.body.mapFile) {
            return res.status(400).send({
                error: "MapFileNotProvided",
                errorMessage: "The Map file was not provided"

            });
        }
        var map = JSON.parse(req.body.mapFile);

        if (!map['targetDataModel']) {
            return res.status(400).send({
                error: "DataModelNotProvided",
                errorMessage: "The Data Model name was empty"

            });
        }
        var dataModel = map['targetDataModel'];

        if ((dataModel = utils.getDataModelPath(dataModel)) == undefined) {
            log.error('Incorrect target Data Model name');
            return false;
        }
        delete map['targetDataModel'];

        // GO!

        process.processSource(sourceData, sourceDataType, map, dataModel);


        return res.status(200).send({
            message: "The mapping process was successfully started, please see the logs/report files (soon there will be a dedicated API for retrieving them)"
        });

    });




    function logErrors(err, req, res, next) {
        console.error(err.stack);
        next(err);
    }
    app.use(logErrors);

    app.listen(port, () => console.log(`Data Model Mapper listening on port ${port}!`));

};