const fs = require('fs');
const config = require('../../../../config')
const Source = require("../models/source.js")
const Map = require("../models/map.js")
const DataModel = require("../models/dataModel.js")
const log = require('../../../utils/logger').app(module);
const axios = require('axios')

module.exports = {

    outputFile: [],

    error: null,

    NGSI_entity: undefined,

    getFilename(id) {

        for (let i = 0; i < id.length; i++) {
            if (id[i] == '/') {
                id = id.substring(i + 1, id.length)
                return this.getFilename(id);
            }
            else if (id[i] == '.') {
                id = id.substring(0, i)
                return id;
            }
        }
        return id;
    },

    async mapData(source, map, dataModel, adapterID, delimiter, entity) {
        const cli = require('../../../cli/setup');
        if (!source || (!map || !dataModel) && !adapterID) {
            let error = {}
            error.message = "Missing fields"
            error.source = source
            error.map = map
            error.dataModel = dataModel
            error.adapterID = adapterID
            process.res.status(400).send(error)
            return "Missing fields"
        }

        process.env.delimiter = delimiter
        this.NGSI_entity = entity

        if (source.id) {
            try { source.data = await Source.findOne({ id: source.id }) }
            catch (error) { 
                console.log(error)
                process.res.sendStatus(404) 
            }
            source.data = source.data.source || source.data.sourceCSV
        }

        if (map.id) {
            try { map = await Map.findOne({ id: map.id }) }
            catch (error) { 
                console.log(error)
                process.res.sendStatus(404) 
            }
            map = [map.map, "mapData"]
        }

        if (dataModel.id) {
            try { dataModel.data = await DataModel.findOne({ id: dataModel.id }) }
            catch (error) { 
                console.log(error)
                process.res.sendStatus(404) 
            }
            dataModel.data = dataModel.data.dataModel
            dataModel.schema_id =
                //dataModel.data.$id || 
                config.modelSchemaFolder + '/DataModelTemp.json'
        }

        if (adapterID) {
            try {
                map = await Map.findOne({ id: adapterID })//type change
            }
            catch (error) { 
                console.log(error)
                process.res.sendStatus(404) 
            }
            dataModel = {}
            dataModel.data = map.dataModel
            if (dataModel.data.schema && !dataModel.data.$schema) dataModel.data.$schema = dataModel.data.schema
            dataModel.schema_id =
                //dataModel.data.$id || 
                config.modelSchemaFolder + '/DataModelTemp.json'
            map = [map.map, "mapData"]//type change
        }

        if (source.url) {
            source.download = await axios.get(source.url)
            source.data = source.download.data
        }

        if (source.data) {
            await fs.writeFile(config.sourceDataPath + 'sourceFileTemp.' + source.type, source.type == "csv" ? source.data : JSON.stringify(source.data), function (err) {
                if (err) throw err;
                log.debug('File sourceData temp is created successfully.');
            })
        }
        if (dataModel.data) {
            await fs.writeFile(
                //dataModel.schema_id || 
                "dataModels/DataModelTemp.json", JSON.stringify(dataModel.data), function (err) {
                    if (err) throw err;
                    log.debug('File dataModel temp is created successfully.');
                })
        }
        await cli(
            source.name ? config.sourceDataPath + source.name : config.sourceDataPath + 'sourceFileTemp.' + source.type,
            map,
            dataModel.name ? dataModel.name : dataModel.schema_id ? this.getFilename(dataModel.schema_id) : "DataModelTemp"
        );
    },

    async getSources() {
        return await Source.find()
    },

    async getMaps() {
        return await Map.find()
    },

    async getDataModels() {
        return await DataModel.find()
    },

    async getSource(id) {
        return await Source.findOne({ id: id })
    },

    async getMap(id) {
        return await Map.findOne({ id: id })
    },

    async getDataModel(id) {
        return await DataModel.findOne({ id: id })
    },

    async insertSource(name, id, source) {
        if (!await Source.findOne({ id: id })) return await Source.insertMany([typeof source === 'string' ? { name: name, id: id, sourceCSV: source } : { name: name, id: id, source: source }])
        else process.res.status(400).send({ error: "id already exists" })
    },//TODO replace with insertOne

    async insertMap(name, id, map, dataModel) {
        if (!await Map.findOne({ id: id })) return await Map.insertMany([{ name: name, id: id, map: map, dataModel: dataModel }])
        else process.res.status(400).send({ error: "id already exists" })
    },//TODO replace with insertOne

    async insertDataModel(name, id, dataModel) {
        if (!await DataModel.findOne({ id: id })) return await DataModel.insertMany([{ name: name, id: id, dataModel: dataModel }])
        else process.res.status(400).send({ error: "id already exists" })
    },//TODO replace with insertOne

    async modifySource(name, id, source) {
        return await Source.findOneAndReplace({ id: id }, typeof source === 'string' ? { name: name, id: id, sourceCSV: source } : { name: name, id: id, source: source })
    },

    async modifyMap(name, id, map, dataModel) {
        return await Map.findOneAndReplace({ id: id }, { name: name, id: id, map: map, dataModel:dataModel })
    },

    async modifyDataModel(name, id, dataModel) {
        return await DataModel.findOneAndReplace({ id: id }, { name: name, id: id, dataModel: dataModel })
    },

    async deleteSource(id) {
        return await Source.deleteOne({ id: id })
    },

    async deleteMap(id) {
        return await Map.deleteOne({ id: id })
    },

    async deleteDataModel(id) {
        return await DataModel.deleteOne({ id: id })
    },
}