const service = require("../services/service.js")
const utils = require("../../../utils/utils.js")
const log = require('../../../utils/logger').app(module);

module.exports = {

    mapData: async (req, res) => {

        if (req.body.file)
            req.body = JSON.parse(req.body.file)

        process.res = res;
        let { sourceData, map, dataModel } = utils.bodyMapper(req.body)

        try {
            await service.mapData(sourceData, map, dataModel, req.body.config)
            if (service.error) res.status(404).send(service.error + ".\nMaybe the files name you specified are not correct.")
        }
        catch (error) {
            console.error(error)
            res.status(400).send(error)
        }
        service.error = null
        log.debug("service.mapData end");
    },

    getSources: async (req, res) => {
        process.res = res;
        try { res.send(await service.getSources()) }
        catch (error) { res.status(400).send(error) }
    },

    getMaps: async (req, res) => {
        process.res = res;
        try { res.send(await service.getMaps()) }
        catch (error) { res.status(400).send(error) }
    },

    getDataModels: async (req, res) => {
        process.res = res;
        try { res.send(await service.getDataModels()) }
        catch (error) { res.status(400).send(error) }
    },

    getSource: async (req, res) => {
        const { id, name } = req.query
        process.res = res;
        try { res.send(await service.getSource(id, name)) }
        catch (error) { res.status(error.code || 400).send(error) }
    },

    getMap: async (req, res) => {
        const { id, name } = req.query
        process.res = res;
        try { res.send(await service.getMap(id, name)) }
        catch (error) {
            res.status(error.code || 400).send(error)
        }
    },

    getConfig: async (req, res) => {
        process.res = res;
        try { res.send(await service.getConfig()) }
        catch (error) { res.status(400).send(error) }
    },

    getDataModel: async (req, res) => {
        const { id, name } = req.query
        process.res = res;
        try { res.send(await service.getDataModel(id, name)) }
        catch (error) { res.status(error.code || 400).send(error) }
    },

    insertSource: async (req, res) => {
        if (req.body.file)
            req.body = JSON.parse(req.body.file)
        process.res = res;
        try { res.send(await service.insertSource(req.body.name, req.body.id, req.body.source, req.body.path, req.body.mapRef)) }
        catch (error) { res.status(400).send(error) }
        log.debug("Source inserted");
    },

    insertMap: async (req, res) => {
        if (req.body.file)
            req.body = JSON.parse(req.body.file)
        process.res = res;
        try {
            res.send(await service.insertMap(req.body.name, req.body.id, req.body.map, req.body.dataModel, req.body.status, req.body.description,
                req.body.sourceData, req.body.sourceDataID, req.body.sourceDataIn, req.body.sourceDataURL, req.body.dataModelIn, req.body.dataModelID, req.body.dataModelURL,
                req.body.config, req.body.sourceDataType, req.body.path))
            log.debug("Map inserted");
        }
        catch (error) { res.status(400).send(error) }
    },

    insertDataModel: async (req, res) => {
        if (req.body.file)
            req.body = JSON.parse(req.body.file)
        process.res = res;
        try { res.send(await service.insertDataModel(req.body.name, req.body.id, req.body.dataModel, req.body.mapRef)) }
        catch (error) { res.status(400).send(error) }
        log.debug("Model inserted");
    },

    modifySource: async (req, res) => {
        if (req.body.file)
            req.body = JSON.parse(req.body.file)
        process.res = res;
        try {
            res.send(await service.modifySource(req.body.name, req.body.id, req.body.source, req.body.path, req.body.mapRef))
            log.debug("Source modified");
        }
        catch (error) { res.status(400).send(error) }
    },

    modifyMap: async (req, res) => {
        if (req.body.file)
            req.body = JSON.parse(req.body.file)
        process.res = res;
        try {
            res.send(await service.modifyMap(req.body.name, req.body.id, req.body.map, req.body.dataModel, req.body.status, req.body.description,
                req.body.sourceData, req.body.sourceDataID, req.body.sourceDataIn, req.body.sourceDataURL, req.body.dataModelIn, req.body.dataModelID, req.body.dataModelURL,
                req.body.config, req.body.sourceDataType, req.body.path))
            log.debug("Map modified");
        }
        catch (error) { res.status(400).send(error) }
    },

    modifyDataModel: async (req, res) => {
        if (req.body.file)
            req.body = JSON.parse(req.body.file)
        process.res = res;
        try {
            res.send(await service.modifyDataModel(req.body.name, req.body.id, req.body.dataModel, req.body.mapRef))
            log.debug("Schema modified");
        }
        catch (error) { res.status(400).send(error) }
    },

    deleteSource: async (req, res) => {
        const { id, name } = req.query
        process.res = res;
        try { res.send(await service.deleteSource(id, name)) }
        catch (error) { res.status(400).send(error) }
    },

    deleteMap: async (req, res) => {
        const { id, name } = req.query
        process.res = res;
        try { res.send(await service.deleteMap(id || req.params.id, name)) }
        catch (error) { res.status(400).send(error) }
    },

    deleteDataModel: async (req, res) => {
        const { id, name } = req.query
        process.res = res;
        try { res.send(await service.deleteDataModel(id, name)) }
        catch (error) { res.status(400).send(error) }
    },

    dereferenceSchema: async (req, res) => {
        process.res = res;
        try { res.send(await service.dereferenceSchema(req.body)) }
        catch (error) { res.status(400).send(error) }
    },


    minio: async (req, res) => {
        req.headers.host = 'platform.beopen-dep.it'
        process.res = res;
        try {
            res.send(await service.minio(req.body, req.headers, req.query))
        }
        catch (error) {
            console.error(error?.response?.data || error)
            res.status(400).send(error)
        }
    },
};