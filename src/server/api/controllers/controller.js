const service = require("../services/service.js")
const config = require('../../../../config')
const log = require('../../../utils/logger').app(module);

module.exports = {

    mapData: async (req, res) => {

        process.res = res;
        await service.mapData(
            req.body.sourceDataIn ? { name: req.body.sourceDataIn } :
                req.body.sourceDataID && req.body.sourceDataType ? { id: req.body.sourceDataID, type: req.body.sourceDataType } :
                    req.body.sourceData && req.body.sourceDataType ? { data: req.body.sourceData, type: req.body.sourceDataType } : false,

            req.body.mapPathIn ? config.sourceDataPath + req.body.mapPathIn :
                req.body.mapID ? { id: req.body.mapID } :
                    req.body.mapData ? [req.body.mapData, "mapData"] : false,

            req.body.dataModelIn ? { name: req.body.dataModelIn } :
                req.body.dataModelID ? { id: req.body.dataModelID } :
                    req.body.dataModel ? { data: req.body.dataModel, schema_id: req.body.dataModel.$id } : false,

            req.body.csvDelimiter || config.delimiter || ','
        )
        log.debug("service.mapData end");
    },

    getSources: async (req, res) => {
        res.send(await service.getSources())
    },

    getMaps: async (req, res) => {
        res.send(await service.getMaps())
    },

    getDataModels: async (req, res) => {
        res.send(await service.getDataModels())
    },

    getSource: async (req, res) => {
        res.send(await service.getSource(req.query.id))
    },

    getMap: async (req, res) => {
        res.send(await service.getMap(req.query.id))
    },

    getDataModel: async (req, res) => {
        res.send(await service.getDataModel(req.query.id))
    },

    insertSource: async (req, res) => {
        res.send(await service.insertSource(req.body.name, req.body.id, req.body.source))
        log.debug("insertSource end");
    },

    insertMap: async (req, res) => {
        res.send(await service.insertMap(req.body.name, req.body.id, req.body.map))
        log.debug("insertMap end");
    },

    insertDataModel: async (req, res) => {
        res.send(await service.insertDataModel(req.body.name, req.body.id, req.body.dataModel))
        log.debug("insertDataModel end");
    },

    modifySource: async (req, res) => {
        res.send(await service.modifySource(req.body.name, req.body.id, req.body.source))
    },

    modifyMap: async (req, res) => {
        res.send(await service.modifyMap(req.body.name, req.body.id, req.body.map))
    },

    modifyDataModel: async (req, res) => {
        res.send(await service.modifyDataModel(req.body.name, req.body.id, req.body.dataModel))
    },

    deleteSource: async (req, res) => {
        res.send(await service.deleteSource(req.query.id))
    },

    deleteMap: async (req, res) => {
        res.send(await service.deleteMap(req.query.id))
    },

    deleteDataModel: async (req, res) => {
        res.send(await service.deleteDataModel(req.query.id))
    }
};