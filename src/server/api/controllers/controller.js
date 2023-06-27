const service = require("../services/service.js")
const config = require('../../../../config')
const log = require('../../../utils/logger').app(module);

module.exports = {

    mapData: async (req, res) => {
        console.debug(req.body)

        process.res = res;

        if (req.body.getMapperList)
            res.send(await service.getMaps())
        else
            await service.mapData(
                req.body.sourceDataIn ? { name: req.body.sourceDataIn } :
                    req.body.sourceDataID && req.body.sourceDataType ? { id: req.body.sourceDataID, type: req.body.sourceDataType } :
                        req.body.sourceDataURL && req.body.sourceDataType ? { url: req.body.sourceDataURL, type: req.body.sourceDataType } :
                            req.body.sourceData && req.body.sourceDataType ? { data: req.body.sourceData, type: req.body.sourceDataType } : false,

                req.body.mapPathIn ? config.sourceDataPath + req.body.mapPathIn :
                    req.body.mapID ? { id: req.body.mapID } :
                        req.body.mapData ? [req.body.mapData, "mapData"] : false,

                req.body.dataModelIn ? { name: req.body.dataModelIn } :
                    req.body.dataModelID ? { id: req.body.dataModelID } :
                        req.body.dataModel ? { data: req.body.dataModel, schema_id: req.body.dataModel.$id } : false,

                req.body.adapterID ? req.body.adapterID : false,

                req.body.csvDelimiter || config.delimiter || ',',
                req.body.NGSI_entity
            )

        if (service.error) res.status(404).send(service.error + ".\nMaybe the files name you specified are not correct.")
        service.error = null
        log.debug("service.mapData end");
    },

    getSources: async (req, res) => {
        process.res = res;
        res.send(await service.getSources())
    },

    getMaps: async (req, res) => {
        process.res = res;
        res.send(await service.getMaps())
    },

    getDataModels: async (req, res) => {
        process.res = res;
        res.send(await service.getDataModels())
    },

    getSource: async (req, res) => {
        process.res = res;
        res.send(await service.getSource(req.query.id))
    },

    getMap: async (req, res) => {
        process.res = res;
        res.send(await service.getMap(req.query.id))
    },

    getDataModel: async (req, res) => {
        process.res = res;
        res.send(await service.getDataModel(req.query.id))
    },

    insertSource: async (req, res) => {
        process.res = res;
        res.send(await service.insertSource(req.body.name, req.body.id, req.body.source))
        log.debug("Source inserted");
    },

    insertMap: async (req, res) => {
        process.res = res;
        res.send(await service.insertMap(req.body.name, req.body.id, req.body.map, req.body.dataModel))
        log.debug("Map inserted");
    },

    insertDataModel: async (req, res) => {
        process.res = res;
        res.send(await service.insertDataModel(req.body.name, req.body.id, req.body.dataModel))
        log.debug("Model inserted");
    },

    modifySource: async (req, res) => {
        process.res = res;
        res.send(await service.modifySource(req.body.name, req.body.id, req.body.source))
    },

    modifyMap: async (req, res) => {
        process.res = res;
        res.send(await service.modifyMap(req.body.name, req.body.id, req.body.map, req.body.dataModel))
    },

    modifyDataModel: async (req, res) => {
        process.res = res;
        res.send(await service.modifyDataModel(req.body.name, req.body.id, req.body.dataModel))
    },

    deleteSource: async (req, res) => {
        process.res = res;
        res.send(await service.deleteSource(req.query.id))
    },

    deleteMap: async (req, res) => {
        process.res = res;
        res.send(await service.deleteMap(req.query.id))
    },

    deleteDataModel: async (req, res) => {
        process.res = res;
        res.send(await service.deleteDataModel(req.query.id))
    }
};