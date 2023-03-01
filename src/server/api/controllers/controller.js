const service = require("../services/service.js")
const config = require('../../../../config')
const log = require('../../../utils/logger').app(module);

module.exports = {

    mapData: async (req, res) => {

        process.res = res;
        await service.mapData(
            //req.body.sourceDataIn ? req.body.sourceDataIn : [req.body.sourceData, req.body.sourceDataType],
            req.body.sourceDataIn ? req.body.sourceDataIn : 
            req.body.sourceDataID ? req.body.sourceDataID : 
            req.body.sourceData && req.body.sourceDataType ? [req.body.sourceData, req.body.sourceDataType] : false,
            req.body.mapPathIn ? config.sourceDataPath + req.body.mapPathIn : [req.body.mapData, "mapData"],
            req.body.dataModelIn ? req.body.dataModelIn : [req.body.dataModel, req.body.dataModel.$id],
            req.body.sourceDataIn ? true : false,
            req.body.sourceDataID ? true : false,
            req.body.mapPathIn ? true : false,
            req.body.dataModelIn ? true : false,
            req.body.csvDelimiter || config.delimiter || ','
        )
        log.debug("service.mapData end");
    },

    insertSource: async (req, res) => {
        res.send(await service.insertSource(req.body.name, req.body.source))
        log.debug("insertSource end");
    },

    insertMap: async (req, res) => {
        res.send(await service.insertMap(req.body.name, req.body.map))
        log.debug("insertMap end");
    },

    insertDataModel: async (req, res) => {
        res.send(await service.insertDataModel(req.body.name, req.body.dataModel))
        log.debug("insertDataModel end");
    },
};