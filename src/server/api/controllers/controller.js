const service = require("../services/service.js")
const config = require('../../../../config')
const log = require('../../../utils/logger').app(module);

module.exports = {

    mapData: async (req, res) => {

        process.res = res;
        await service.mapData(
            req.body.sourceDataIn ? {name: req.body.sourceDataIn} :
            req.body.sourceDataID && req.body.sourceDataType ?{ id: req.body.sourceDataID, type: req.body.sourceDataType} :
            req.body.sourceData && req.body.sourceDataType ? { data: req.body.sourceData, type: req.body.sourceDataType} : false,

            req.body.mapPathIn ? config.sourceDataPath + req.body.mapPathIn : 
            req.body.mapID ? {id : req.body.mapID} : 
            req.body.mapData ? [req.body.mapData, "mapData"] : false,

            req.body.dataModelIn ? req.body.dataModelIn : [req.body.dataModel, req.body.dataModel.$id],
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