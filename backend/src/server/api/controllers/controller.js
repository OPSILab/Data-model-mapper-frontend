const service = require("../services/service.js")
const utils = require("../../../utils/utils.js")
const log = require('../../../utils/logger').app(module);

module.exports = {

    mapData: async (req, res) => {

        console.debug(req.body)

        process.res = res;
        let { sourceData, map, dataModel } = utils.bodyMapper(req.body)
        await service.mapData(sourceData, map, dataModel, req.body.config) //TODO delete adapterID
        try { if (service.error) res.status(404).send(service.error + ".\nMaybe the files name you specified are not correct.") }
        catch (error) { console.error(error) }
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
        try {
            res.send(await service.insertMap(req.body.name, req.body.id, req.body.map, req.body.dataModel, req.body.status, req.body.description,
                req.body.sourceData, req.body.sourceDataID, req.body.sourceDataIn, req.body.sourceDataURL, req.body.dataModelIn, req.body.dataModelID, req.body.dataModelURL,
                req.body.config, req.body.sourceDataType))
            log.debug("Map inserted");
        }
        catch (error) {
            log.error(error.message)
        }
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
        //console.debug(req.body)
        process.res = res;
        res.send(await service.modifyMap(req.body.name, req.body.id, req.body.map, req.body.dataModel, req.body.status, req.body.description,
            req.body.sourceData, req.body.sourceDataID, req.body.sourceDataIn, req.body.sourceDataURL, req.body.dataModelIn, req.body.dataModelID, req.body.dataModelURL,
            req.body.config, req.body.sourceDataType))
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
        res.send(await service.deleteMap(req.query.id || req.params.id))
    },

    deleteDataModel: async (req, res) => {
        process.res = res;
        res.send(await service.deleteDataModel(req.query.id))
    }
};