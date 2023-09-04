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

    async mapData(source, map, dataModel, configIn) {

        const cli = require('../../../cli/setup');

        if (map?.id) {

            try {
                map = await Map.findOne({ id: map.id })
            }
            catch (error) {
                console.log(error)
                process.res.sendStatus(404)
            } 

            if (!map.dataModel.$schema && map.dataModel.schema)
                map.dataModel.$schema = map.dataModel.schema
            if (!map.dataModel.$id && map.dataModel.id)
                map.dataModel.$id = map.dataModel.id

            dataModel.schema_id =
                //dataModel.data.$id || 
                config.modelSchemaFolder + '/DataModelTemp.json'

            if (map.sourceData) source.data = map.sourceData
            if (map.sourceDataID) source.id = map.sourceDataID
            if (map.sourceDataURL) source.url = map.sourceDataURL
            if (map.dataModel) {
                dataModel = {}
                dataModel.data = map.dataModel
            }
            if (map.dataModelID) dataModel.id = map.dataModelID
            if (map.dataModelURL) dataModel.url = map.dataModelURL
            if (map.sourceDataType) source.type = map.sourceDataType
            if (map.config) configIn = map.config

            console.debug(map)
            console.debug(source)
            map = [map.map, "mapData"]
        }

        if (!(source.name || (source.type && (source.data || source.url || source.id))) || (!map || !(dataModel.id || dataModel.data || dataModel.name || dataModel.url))) {
            let error = {}
            error.message = "Missing fields"
            error.source = source
            error.map = map
            error.dataModel = dataModel
            process.res.status(400).send(error)
            return "Missing fields"
        }

        if (!Array.isArray(source.data) && source.type == "json" || source.type == ".json" || source.type == "JSON" || source.type == ".JSON") source.data = [source.data]

        if (config.backup) {
            for (let configKey in config.backup)
                config[configKey] = config.backup[configKey]
            config.backup = undefined
        }

        if (configIn)
            for (let configKey in configIn) {
                if (!config.backup) config.backup = {}
                config.backup[configKey] = config[configKey]
                config[configKey] = configIn[configKey]
            }

        process.env.delimiter = configIn ? configIn.delimiter : config.delimiter || ','
        if (config.NGSI_entity != undefined) this.NGSI_entity = config.NGSI_entity

        if (source.id) {
            try { source.data = await Source.findOne({ id: source.id }) }
            catch (error) {
                console.log(error)
                process.res.sendStatus(404)
            }
            source.data = source.data.source || source.data.sourceCSV
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

        if (source.data) {
            fs.writeFile(config.sourceDataPath + 'sourceFileTemp.' + source.type, source.type == "csv" ? source.data : JSON.stringify(source.data), function (err) {
                if (err) throw err;
                log.debug('File sourceData temp is created successfully.');
            })
        }

        else if (source.url) {
            source.download = await axios.get(source.url)
            source.data = source.download.data
        }

        if (dataModel.url) {
            dataModel.download = await axios.get(dataModel.url)
            dataModel.data = dataModel.download.data
        }

        if (dataModel.data) {
            console.debug(dataModel.data)
            console.debug(this.dataModelDeClean(dataModel.data))
            fs.writeFile(
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

    async insertMap(name, id, map, dataModel, status, description,
        sourceData, sourceDataID, sourceDataIn, sourceDataURL, dataModelIn, dataModelID, dataModelURL,
        config, sourceDataType) {
        if (!dataModelIn && !dataModelID && !dataModelURL && !dataModel)
            process.res.status(400).send({ error: "schema is required" })
        if (!await Map.findOne({ id: id }))
            return await Map.insertMany([{
                name: name,
                id: id,
                map: map,
                dataModel: dataModel,
                status: status,
                description: description,
                sourceData,
                sourceDataID,
                sourceDataIn,
                sourceDataURL,
                dataModelIn,
                dataModelID,
                dataModelURL,
                config,
                sourceDataType
            }])
        else process.res.status(400).send({ error: "id already exists" })
    },//TODO replace with insertOne

    async insertDataModel(name, id, dataModel) {
        if (!await DataModel.findOne({ id: id })) return await DataModel.insertMany([{ name: name, id: id, dataModel: dataModel }])
        else process.res.status(400).send({ error: "id already exists" })
    },//TODO replace with insertOne

    async modifySource(name, id, source) {
        return await Source.findOneAndReplace({ id: id }, typeof source === 'string' ? { name: name, id: id, sourceCSV: source } : { name: name, id: id, source: source })
    },

    call: 0,

    dataModelClean(dataModel) {
        this.call++;
        //console.debug(this.call)
        //console.debug(dataModel)
        for (let key in dataModel) {
            //console.debug("dataModel")
            //console.debug(dataModel)
            //console.debug("key")
            //console.debug(key)
            if (Array.isArray(dataModel[key]) || typeof dataModel[key] == "object")
                dataModel[key] = this.dataModelClean(dataModel[key])
            else if (key.startsWith("$")) {
                //console.debug("dataModel")
                //console.debug(dataModel)
                //console.debug("key")
                //console.debug(key)
                dataModel["dollar" + key.substring(1)] = dataModel[key]
                dataModel[key] = undefined
            }
        }
        return dataModel
    },

    dataModelDeClean(dataModel) {
        this.call++;
        for (let key in dataModel) {
            if (Array.isArray(dataModel[key]) || typeof dataModel[key] == "object")
                dataModel[key] = this.dataModelDeClean(dataModel[key])
            else if (key.startsWith("dollar")) {
                dataModel["$" + key.substring(6)] = dataModel[key]
                dataModel[key] = undefined
            }
        }
        return dataModel
    },

    async modifyMap(name, id, map, dataModel, status, description, sourceData, sourceDataID, sourceDataIn, sourceDataURL, dataModelIn, dataModelID, dataModelURL,
        config, sourceDataType) {

        //if (dataModel && dataModel.$schema)
        //    dataModel.schema = dataModel.$schema

        //if (dataModel && dataModel.$id)
        //    dataModel.id = dataModel.$id

        //if (dataModel) dataModel.$schema = dataModel.$id = undefined

        if (dataModel) dataModel = this.dataModelClean(dataModel)

        return await Map.findOneAndReplace(
            {
                id: id
            },

            {
                name: name,
                id: id,
                map: map,
                dataModel: dataModel,
                status: status,
                description: description,
                sourceData,
                sourceDataID,
                sourceDataIn,
                sourceDataURL,
                dataModelIn,
                dataModelID,
                dataModelURL,
                config,
                sourceDataType
            })
    },

    async modifyDataModel(name, id, dataModel) {
        dataModel = this.dataModelClean(dataModel)
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