const fs = require('fs');
const config = require('../../../../config')
const Source = require("../models/source.js")
const Map = require("../models/map.js")
const DataModel = require("../models/dataModel.js")
const log = require('../../../utils/logger').app(module);
const axios = require('axios')
const RefParser = require('json-schema-ref-parser');
let a = 5

const https = require('https');

const agent = new https.Agent({
    rejectUnauthorized: false
});

function e(error) {
    let str = ""
    var util = require('util')
    for (let key in error) {
        //console.debug("{\n", key, " : ", response[key], "\n},\n")
        try {
            str = str.concat("{\n", '"', key, '"', " : ", JSON.stringify(error[key]), "\n},\n")
        }
        catch (error) {
            //console.error(error.message)
            str = str.concat("{\n", '"', key, '"', " : ", util.inspect(error[key]), "\n},\n")
            console.debug("corrected")
        }
    }

    var fs = require('fs');

    fs.writeFile("D:\\log" + JSON.stringify(a) + ".json", "[" + str.substring(0, str.length - 1) + "]", function (err) {
        if (err) throw err;
        console.debug('Log is created successfully.');
    })

    a++
}

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

    async minio(body, headers, query) {
        console.debug("service , call to ", config.minioWriter.endPoint)
        let res = await axios.post("https://" + config.minioWriter.endPoint, body, { httpsAgent: agent, /*params: query,*/ headers: headers })
        console.debug("---------------RES-------------------")
        console.debug(res.data)
        return res.data
        //console.debug(body, "\n", headers,  "\n", query)

        //let res
        //try {
        //res = 
        //return (
        /*{...header, cookie : 
        let res = (await axios.post("http://" + "localhost:5502/minio/datamodelmapper", { ok: "ok" }, { params: query, headers: headers/*{...header, cookie : "token=AEhj4cX4Uw12UU3p0sMSLPUYE80bkEL+O1Kohe9YvDVhNI+yFCt7o9wRwh2bu1t9irvmBCQ1puOFevbotG7IcdcX1EftDqK4H25fQJpWGxyxP1r1mP6gso0nzP7RvBiY/qKAzAmXN8s87BZL4qZ48/aNIG8nE0VyOF3HmWvmMXfWxCBKOPIXWiuJyEpnJKbDWZ3oznMBRGZJEum/uaWHhfaw7uEmVWA3GXEndx8GNWwcBqaJG6UJjAnHq6HEdjvRorBHWyHRX9oFf9APjxbZTokAhCjy4sODGgwi46lb7GLIvBTqi4gjiSC6btZgpUDaYhXbp3vAKyvRpv330S08MSyjQsYwW7lxprJIL1IPQKWoAWtE5gUWZwP2t0NMPzBYy8h/8I/eG67VhGVNcy2wBX2kN0PP15Q2Yjo3UaMpMQ+Wulqeo+EUh2w3ZelrxamCFQi1X90jhESHS32gLUeVIs+jGmwIkymA2tOTtmP7XvuPE1lCpqJso3Wx9iXcfuw97gktDN8pTiG5uhHAaKGPKd3Ok8t6gKgltVVL0dGrWl44BEWP5gxvAd4s+X0lRv4ebzKPqmbtO7ikccBxUvfhtdptmO7BXapqR8kQk0OgpXSONWJjfaVk8fE3YITwGusy9QFdBfB2o90IWucAHhAEN33gkVViLhyYPC07eHTT8u8iq75IQyqR15WFcl9ltYBnieeMQoWc/sMh0EJChA3fZk6xr2FWVhEmlkMNXNSYnnjiumdfJo6IcvEgIek3+5GhCKfOov05/RytRG+jE0aqzdJTur7BH6vDMa14pzqOJsdxlltXXn63M5+h9N7A3g+oPHfwSCNUIxrNDJzOqnNVd4J+J0FRf2YeUoS9UX4P9nUGv1Bbjpj0f+51Y4oooSDMChktWubmbQbWQxIOeoBCZz0hAHfhgNPdqXQdN4FL8A28MZhv/cVzkksdtbBtW9JfTWBQ7cbtz6Yd16w1sPio50+JoPj0BOm9aKJG6qLPB6IbAT/WCt37kUVhDehfvf1tH14sLD5wW9qm6fnqU67DCmncbWVR74eMCxvtKoRzfq42p5OIS8Y30xFt2juAcmvv/yCKADqIlhLBeFBxp8XQkqYNlP0C0ROXA2dqybcx0d83Z2Mt6CJ29uTcqG3pjEFZKDANUT0GTytvg3RmhkgHSp8DAsNIvSLmehUDmlfEOK8DE7iWTb8EN3gDeUZRaLZbQ0LMaOMzGLT8q2jyTtKior3FwLLZFQ5Iyr7dQnT2QbNytQx5aO2p1mEdL4u6; idp-refresh-token=eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJmNTI1YWE0NS1mNWNiLTRkNDUtOGExZC1mYTMzOGY3YWJlNmMifQ.eyJleHAiOjE3MDcyMTYyOTYsImlhdCI6MTcwNzIxNDQ5NiwianRpIjoiMTMwYTgzZWYtNDc4NC00ZGQ2LWE4YjEtMWRhMTQyZTA2NmEyIiwiaXNzIjoiaHR0cHM6Ly9wbGF0Zm9ybS5iZW9wZW4tZGVwLml0L2F1dGgvcmVhbG1zL21hc3RlciIsImF1ZCI6Imh0dHBzOi8vcGxhdGZvcm0uYmVvcGVuLWRlcC5pdC9hdXRoL3JlYWxtcy9tYXN0ZXIiLCJzdWIiOiI3M2QyNDY5Yi05YTNmLTQ1NDAtYjQyYy05YmI4YTNkZGRiYTIiLCJ0eXAiOiJSZWZyZXNoIiwiYXpwIjoibWluaW8tYXBwIiwic2Vzc2lvbl9zdGF0ZSI6ImM1YmE5YzY3LWZjOTQtNDI2OC1iMWFhLTA3OGFiY2M0NzNjMSIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJzaWQiOiJjNWJhOWM2Ny1mYzk0LTQyNjgtYjFhYS0wNzhhYmNjNDczYzEifQ.fjl2UiHVb9Xd9XpQa1xNJ-r7goqM6mX0_00Z047hxyw" }*/

        //console.debug()
        //}
        //catch (error) {
        //    console.error(error?.response?.data || error)
        //e(error)
        //    throw error
        //}
        //.data// || JSON.stringify(res)
    },

    getConfig() {
        let configCopy = JSON.parse(JSON.stringify(config))

        configCopy.mongo =
            configCopy.writers =
            configCopy.fileWriter =
            configCopy.debugger =
            configCopy.orionWriter =
            configCopy.regexClean =
            configCopy.mapPath =
            configCopy.sourceDataPath =
            configCopy.modelSchemaFolder =
            configCopy.httpPort =
            configCopy.logLevel =
            configCopy.mode =
            configCopy.NODE_ENV =
            configCopy.LOG =
            configCopy.MODE =
            configCopy.SUPPRESS_NO_CONFIG_WARNING =
            configCopy.env = undefined
        return configCopy
    },

    async mapData(source, map, dataModel, configIn) {

        //this.restoreDefaultConfs()

        const cli = require('../../../cli/setup');

        if (map?.id) {

            try {
                map = await Map.findOne({ _id: map.id })
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

            if (map.sourceDataIn && !source.name) source.name = map.sourceDataIn
            if (map.sourceData && !source.data) source.data = map.sourceData
            if (map.sourceDataID && !source.id) source.id = map.sourceDataID
            if (map.sourceDataURL && !source.url) source.url = map.sourceDataURL
            if (map.dataModelIn && !dataModel.name) dataModel.name = map.dataModelIn
            if (map.dataModel && !dataModel.data) dataModel.data = map.dataModel
            if (map.dataModelID && !dataModel.id) dataModel.id = map.dataModelID
            if (map.dataModelURL && !dataModel.url) dataModel.url = map.dataModelURL
            if (map.sourceDataType) source.type = map.sourceDataType
            if (map.config) configIn = map.config

            map = [map.map, "mapData"]
        }

        if (!(source.name || (source.type && (source.data || source.url || source.id))) || (!map || !(dataModel.id || dataModel.data || dataModel.name || dataModel.url))) {

            throw {
                message: "Missing fields",
                source: source,
                map: map,
                dataModel: dataModel
            }
        }

        if (!Array.isArray(source.data) && (source.type == "json" || source.type == ".json" || source.type == "JSON" || source.type == ".JSON"))
            source.data = [source.data]

        if (config.backup) {
            for (let configKey in config.backup)
                config[configKey] = config.backup[configKey]
            config.backup = undefined
        }

        if (configIn)
            for (let configKey in configIn) {
                if (!config.backup) config.backup = {}
                config.backup[configKey] = config[configKey]
                if (configIn[configKey] != "undefined") config[configKey] = configIn[configKey]
            }

        config.delimiter = configIn ? configIn.delimiter : config.delimiter || ','
        if (config.NGSI_entity != undefined) this.NGSI_entity = config.NGSI_entity

        if (source.id) {
            try { source.data = await Source.findOne({ _id: source.id }) }
            catch (error) {
                console.log(error)
                process.res.sendStatus(404)
            }
            source.data = source.data.source || source.data.sourceCSV
        }

        if (dataModel.id) {
            try { dataModel.data = await DataModel.findOne({ _id: dataModel.id }) }
            catch (error) {
                console.log(error)
                process.res.sendStatus(404)
            }
            dataModel.data = dataModel.data.dataModel
            dataModel.schema_id =
                //dataModel.data.$id || 
                config.modelSchemaFolder + '/DataModelTemp.json'
        }
        //let sourceFileTemp2 = false
        if (!source.data && source.url) {
            source.download = await axios.get(source.url)
            source.data = source.download.data
            /*
            fs.writeFile(config.sourceDataPath + 'sourceFileTemp2.' + source.type, source.type == "csv" ? source.data : JSON.stringify(source.data), function (err) {
                if (err) throw err;
                log.debug('File sourceData temp is created successfully.');
            })*/
            //sourceFileTemp2 = true
        }

        if (source.data) {
            fs.writeFile(config.sourceDataPath + 'sourceFileTemp.' + source.type, source.type == "csv" ? source.data : JSON.stringify(source.data), function (err) {
                if (err) throw err;
                log.debug('File sourceData temp is created successfully.');
            })
        }

        if (source.data && source.path) source.data = source.data[source.path]

        if (dataModel.url) {
            dataModel.download = await axios.get(dataModel.url)
            dataModel.data = dataModel.download.data
        }

        if (dataModel.data) {
            console.log(this.dataModelDeClean(dataModel.data))
            fs.writeFile(
                //dataModel.schema_id || 
                "dataModels/DataModelTemp.json", JSON.stringify(dataModel.data), function (err) {
                    if (err) throw err;
                    log.debug('File dataModel temp is created successfully.');
                })
        }
        try {
            await cli(
                //source.name ? config.sourceDataPath + source.name : config.sourceDataPath + sourceFileTemp2 ? 'sourceFileTemp2.' + source.type : 'sourceFileTemp.' + source.type,
                source.name ? config.sourceDataPath + source.name : config.sourceDataPath + 'sourceFileTemp.' + source.type,
                map,
                dataModel.name ? dataModel.name : dataModel.schema_id ? this.getFilename(dataModel.schema_id) : "DataModelTemp"
            );
        }
        catch (error) {
            console.log(error)
            return error.toString()
        }
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

    async getSource(id, name) {
        let source = await Source.findOne(id ? { _id: id } : { name })
        if (!source) throw { code: 404, message: "NOT FOUND" }
        return source
    },

    async getMap(id, name) {
        let map = await Map.findOne(id ? { _id: id } : { name })
        if (!map) throw { code: 404, message: "NOT FOUND" }
        return map
    },

    async getDataModel(id, name) {
        let dataModel = await DataModel.findOne(id ? { _id: id } : { name })
        if (!dataModel) throw { code: 404, message: "NOT FOUND" }
        return dataModel
    },

    async parseDataModelSchema(schemaPath) {

        return RefParser.dereference(schemaPath).then((schema) => {

            var rootProperties

            if (schema.allOf) {
                rootProperties = schema.allOf.pop().properties;

                for (var allOf of schema.allOf) {

                    if (allOf.allOf) {
                        // nested allOf 
                        for (var nestedAllOf of allOf.allOf) {
                            let head = nestedAllOf.properties;
                            for (let key in head) {
                                rootProperties[key] = head[key];
                            }
                        }
                    } else if (allOf.properties) {
                        let head = allOf.properties;
                        for (let key in head) {
                            rootProperties[key] = head[key];
                        }
                    }
                }
            }
            else rootProperties = schema.properties
            schema.allOf = new Array({ properties: rootProperties });

            return new Promise((resolve, reject) => {
                resolve(schema);
            });
        });

    },

    async dereferenceSchema(schema) {
        let schemaCleaned = this.dataModelDeClean(schema)
        let schemaFixed = this.dataModelRefFix(schemaCleaned)
        let schemaDereferenced = await this.parseDataModelSchema(schemaFixed)
        return schemaDereferenced
    },

    async insertSource(name, id, source, path, mapRef) {
        if (!source)
            throw { error: "source is required" }
        if (path == "") path = undefined
        if (mapRef)
            mapRef = (await Map.findOne({ name }))?._id
        if (mapRef || !await Source.findOne({ name })) return await Source.insertMany([typeof source === 'string' ? { name: name, id: id, sourceCSV: source, mapRef: mapRef.toString() } : { name: name, id: id, source: source, path, mapRef: mapRef.toString() }])
        throw { "error": "name already exists" }
    },//TODO replace with insertOne

    async insertMap(name, id, map, dataModel, status, description,
        sourceData, sourceDataID, sourceDataIn, sourceDataURL, dataModelIn, dataModelID, dataModelURL,
        config, sourceDataType, path) {
        if (path == "") path = undefined
        if ((!dataModelIn && !dataModelID && !dataModelURL && !dataModel))
            throw { error: "schema is required" }
        if (dataModel) dataModel = this.dataModelClean(dataModel, {})
        if (!await Map.findOne({ name }))
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
                sourceDataType,
                path
            }])
        throw { "error": "name already exists" }
    },//TODO replace with insertOne

    async insertDataModel(name, id, dataModel, mapRef) {
        if (!dataModel)
            throw { error: "schema is required" }
        if (dataModel) dataModel = this.dataModelClean(dataModel, {})
        if (mapRef)
            mapRef = (await Map.findOne({ name }))?._id
        if (mapRef || !await DataModel.findOne({ name })) return await DataModel.insertMany([{ name: name, id: id, dataModel: dataModel, mapRef: mapRef.toString() }])
        throw { "error": "name already exists" }
    },//TODO replace with insertOne

    async modifySource(name, id, source, path, mapRef) {
        if (!source)
            throw { error: "source is required" }
        if (path == "") path = undefined
        if (mapRef)
            mapRef = (await Map.findOne({ name }))?._id
        mapRef = mapRef.toString()
        let result = await Source.findOneAndReplace(mapRef ? { mapRef } : { name }, typeof source === 'string' ? { name: name, id: id, sourceCSV: source, mapRef: mapRef.toString() } : { name: name, id: id, source: source, path: path, mapRef: mapRef.toString() })
        return result
    },

    call: 0,

    dataModelClean(dataModel, dataModelCleaned) {
        this.call++;
        for (let key in dataModel)
            if (Array.isArray(dataModel[key]) || typeof dataModel[key] == "object")
                dataModelCleaned[key] = this.dataModelClean(dataModel[key], dataModelCleaned[key] || {})
            else if (key.startsWith("$"))
                dataModelCleaned["dollar" + key.substring(1)] = dataModel[key] //dataModel[key] = undefined
            else
                dataModelCleaned[key] = dataModel[key]
        return dataModelCleaned
    },

    dataModelRefFix(dataModel) {
        this.call++;
        for (let key in dataModel) {
            if (Array.isArray(dataModel[key]) || typeof dataModel[key] == "object")
                dataModel[key] = this.dataModelRefFix(dataModel[key])
            else if (key.startsWith("$") && !dataModel[key].startsWith("http"))
                dataModel[key] = config.modelSchemaFolder + "//" + JSON.parse(JSON.stringify(dataModel[key]))
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
        config, sourceDataType, path) {

        //if (dataModel && dataModel.$schema)
        //    dataModel.schema = dataModel.$schema

        //if (dataModel && dataModel.$id)
        //    dataModel.id = dataModel.$id

        //if (dataModel) dataModel.$schema = dataModel.$id = undefined

        if ((!dataModelIn && !dataModelID && !dataModelURL && !dataModel))
            throw { error: "schema is required" }

        if (path == "") path = undefined

        if (dataModel) dataModel = this.dataModelClean(dataModel, {})

        return await Map.findOneAndReplace(
            {
                name
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
                sourceDataType,
                path
            })
    },

    async modifyDataModel(name, id, dataModel, mapRef) {
        if (!dataModel)
            throw { error: "schema is required" }
        dataModel = this.dataModelClean(dataModel, {})
        if (mapRef)
            mapRef = (await Map.findOne({ name }))?._id
        mapRef = mapRef.toString()
        return await DataModel.findOneAndReplace(mapRef ? { mapRef } : { name }, { name: name, id: id, dataModel: dataModel, mapRef: mapRef.toString() })
    },

    async deleteSource(id, name) {
        return await Source.deleteOne(id ? { _id: id } : { name })
    },

    async deleteMap(id, name) {

        let mapRef
        if (!id)
            mapRef = (await Map.findOne({ name }))._id
        let deletion = await Map.deleteOne(id ? { _id: id } : { name })
        await Source.deleteOne({ mapRef: id || mapRef })
        await DataModel.deleteOne({ mapRef: id || mapRef })
        if (deletion.deletedCount)
            return deletion
        throw { code: 404, message: "NOT FOUND" }

    },

    async deleteDataModel(id, name) {
        return await DataModel.deleteOne(id ? { _id: id } : { name })
    },
}