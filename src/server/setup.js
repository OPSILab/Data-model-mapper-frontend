const log = require('../utils/logger').app;
const config = require('../../config');
const utils = require('../utils/utils');
const confUtils = require('../utils/confUtils');
const _ = require('lodash');

/*
 * Set default configuration from congif.js file, these will be in case overriden by requests params
 */
const initDefaultConf = () => {
    if (confUtils.init()) {
        global.process.env.orionUrl = confUtils.getParam('orionUrl');
        global.process.env.outFilePath = confUtils.getParam('outFilePath');
        global.process.env.rowStart = confUtils.getParam('rowStart');
        global.process.env.rowEnd = confUtils.getParam('rowEnd');
        return true;
    } else
        return false;
};

const setAuthHeaders = (hdrs) => {
    if (_.has(hdrs, 'authorization')) {
        process.env.OAUTH_TOKEN = hdrs.authorization;
    }
    if (_.has(hdrs, 'x-auth-token')) {
        process.env.PAUTH_TOKEN = hdrs['x-auth-token'];
    }
};

const logErrors = (err, req, res, next) => {
    log.error(err.stack);
    next(err);
};

module.exports = () => {

    /* General Exprss configuration */
    //const bodyParser = require('body-parser');
    const express = require('express');
    const busboy = require('connect-busboy');
    const app = express();
    const port = config.httpPort || 8080;

    /* Load Request Handler middlewares */
    const mapRequestHandler = require('./mapRequestHandler');

    log.info("Initializing Mapper in Server Mode");

    /* Initialize default configuration */
    if (initDefaultConf()) {

        /* Middlewares configuration */
        //app.use(bodyParser.urlencode({ extended: true }));
        //app.use(bodyParser.json());
        app.use(busboy()); // Insert the busboy middleware
        app.use((req, res, next) => {
            setAuthHeaders(req.headers);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
            next();
        });
        app.use(logErrors);

        /* Request handlers */
        /* Start Map - Request Handler */
        app.post('/api/map', (req, res) => { mapRequestHandler(req, res); });

        /* Start Server listening */
        app.listen(port, () => console.log(`Data Model Mapper listening on port ${port}!`));

    } else {
        log.error("There was an error while initializing Mapper configuration");
    }


    /* OLD 
    app.post('/api/map', upload.fields([{ name: 'mapFile', maxCount: 1 }, { name: 'sourceData', maxCount: 1 }]), async (req, res) => {
    
        var sourceData = undefined;
        var sourceDataType = undefined;
        var map = undefined;
        var dataModel = undefined;
    
        if (req.files && req.files['sourceData']) {
    
            sourceData = req.files['sourceData'][0];
    
        } else if (req.body && req.body.sourceData) {
            if (!req.body.sourceDataType) {
    
                let error = {
                    error: "SourceDataTypeNotProvided",
                    errorMessage: "The Source Data Type (extension) was not provided"
                };
    
                log.debug(error.error + " " + error.errorMessage);
                return res.status(400).send(error);
            }
    
            sourceData = req.body.sourceData;
    
        } else {
            let error = {
                error: "SourceDataNotProvided",
                errorMessage: "The Source data (as file, url/path, or directly as string), was not provided"
            };
    
            log.debug(error.error + " " + error.errorMessage);
            return res.status(400).send(error);
        }
    
        try {
            if (req.files && req.files['mapFile']) {
    
                map = JSON.parse(req.files['mapFile'][0]);
    
            } else if (req.body && req.body.mapFile) {
    
                let mapFromBody = req.body.mapFile;
    
                try {
                    map = utils.parseFilePath(mapFromBody);
                } catch (error) {
                    map = JSON.parse(mapFromBody);
                }
    
            } else {
                let error = {
                    error: "MapFileNotProvided",
                    errorMessage: "The Map (as file, url/path, or directly as string), was not provided"
                };
    
                log.debug(error.error + " " + error.errorMessage);
                return res.status(400).send(error);
            }
    
        } catch (error) {
            let response = {
                error: "MapDataNotValid - " + error,
                errorMessage: "The provided Map data is neither a file, url/path, or directly a string"
            };
    
            log.debug(response.error + " " + response.errorMessage);
            return res.status(400).send(response);
    
        }
    
        if (map['targetDataModel']) {
    
            dataModel = map['targetDataModel'];
    
        } else if (req.body && req.body.targetDataModel) {
    
            dataModel = req.body.targetDataModel;
    
        } else {
            let error = {
                error: "DataModelNotProvided",
                errorMessage: "The Data Model name was empty"
            };
    
            log.debug(error.error + " " + error.errorMessage);
            return res.status(400).send(error);
    
        }
    
    
        if ((dataModel = utils.getDataModelPath(dataModel)) === undefined) {
            let error = {
                error: "DataModelNotValid",
                errorMessage: "Incorrect target Data Model name"
            };
    
            log.debug(error.error + " " + error.errorMessage);
            return res.status(400).send(error);
    
        }
    
        delete map['targetDataModel']; // use targetDataModel as reserved field ???
    
        // GO!
        process.processSource(sourceData, sourceDataType, map, dataModel);
    
        let startResponse = {
            message: "The mapping process was successfully started, please see the logs/report files (soon there will be a dedicated API for retrieving them)"
        };
    
        log.debug(startResponse);
        return res.status(200).send(startResponse);
    
    });
    */

};