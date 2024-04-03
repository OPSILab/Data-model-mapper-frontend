const fs = require('fs');
const config = require('../../../../config')
const Source = require("../models/source.js")
const Map = require("../models/map.js")
const DataModel = require("../models/dataModel.js")
const log = require('../../../utils/logger')//.app(module);
const Log = require('../models/log')
const { Logger } = log
const logger = new Logger(__filename)
const axios = require('axios')
const RefParser = require('json-schema-ref-parser');
const minioWriter = require('../../../writers/minioWriter')
const common = require('../../../utils/common')

if (common.isMinioWriterActive())
    if (config.minioWriter.subscribe.all)
        minioWriter.listBuckets().then((buckets) => {
            let a = 0
            for (let bucket of buckets) {
                logger.debug(bucket.name)
                minioWriter.getNotifications(bucket.name)
                logger.debug((a++) + " " + buckets.length)
            }
        })
    else for (let bucket of config.minioWriter.subscribe.buckets)
        minioWriter.getNotifications(bucket)

module.exports = {

    outputFile: [],

    minioObj: undefined,

    bucketName: undefined,

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

    async minioCreateBucket(bucketName) {
        let createdResult = await minioWriter.creteBucket(bucketName, config.minioWriter.location)
        logger.debug("created result:\t" + createdResult)
        return createdResult
    },

    async minioGetBuckets() {
        return await minioWriter.listBuckets()
    },

    async minioSubscribe(bucketName) {
        minioWriter.setNotifications(bucketName)
        minioWriter.subscribe(bucketName)
        minioWriter.getNotifications(bucketName)
        return 'subscribed'
    },

    async minioInsertObject(bucketName, objectName, object) {
        return await minioWriter.stringUpload(bucketName, objectName, object)
    },

    async minioGetObject(bucketName, objectName, format) {
        return await minioWriter.getObject(bucketName, objectName, format)
    },

    async minioListObjects(bucketName) {
        return await minioWriter.listObjects(bucketName)
    },

    getConfig() {
        let configCopy = JSON.parse(JSON.stringify(config))

        configCopy.mongo =
            configCopy.host =
            configCopy.externalPort =
            configCopy.writers =
            configCopy.minioWriter =
            configCopy.authConfig =
            configCopy.fileWriter =
            configCopy.debugger =
            configCopy.orionWriter =
            configCopy.regexClean =
            configCopy.mapPath =
            configCopy.sourceDataPath =
            configCopy.modelSchemaFolder =
            configCopy.httpPort =
            configCopy.logLevel =
            configCopy.validCount =
            configCopy.unvalidCount =
            configCopy.orionWrittenCount =
            configCopy.orionUnWrittenCount =
            configCopy.orionSkippedCount =
            configCopy.fileWrittenCount =
            configCopy.fileUnWrittenCount =
            configCopy.rowNumber =
            configCopy.orionUrl =
            configCopy.updateMode =
            configCopy.fiwareService =
            configCopy.fiwareServicePath =
            configCopy.orionAuthHeaderName =
            configCopy.orionAuthToken =
            configCopy.outFilePath =
            configCopy.mode =
            configCopy.NODE_ENV =
            configCopy.LOG =
            configCopy.MODE =
            configCopy.SUPPRESS_NO_CONFIG_WARNING =
            configCopy.env = undefined
        return configCopy
    },

    resetConfig: (request, response, next) => {
        if (config.backup) {
            for (let configKey in config.backup)
                config[configKey] = config.backup[configKey]
            config.backup = undefined
        }
        next()
    },

    async mapData(source, map, dataModel, configIn) {

        //this.restoreDefaultConfs()

        const cli = require('../../../cli/setup');

        if (map?.id) {

            map = await Map.findOne({ _id: map.id })

            if (!map.dataModel?.$schema && map.dataModel?.schema)
                map.dataModel.$schema = map.dataModel.schema
            if (!map.dataModel?.$id && map.dataModel?.id)
                map.dataModel.$id = map.dataModel.id

            if (dataModel)
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

            map = [map.map, "mapData"] //TODO change this array form if possible
        }

        if (!(source.name || (source.type && (source.data || source.url || source.id || source.minioObjName))) || (!map || !(dataModel.id || dataModel.data || dataModel.name || dataModel.url))) {

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

        if (source.id && !source.data[0]) {
            try { source.data = await Source.findOne({ _id: source.id }) }
            catch (error) {
                logger.error(error)
                process.res.sendStatus(404)
            }
            source.data = source.data.source || source.data.sourceCSV
        }

        if (source.minioObjName && !source.data[0]) {
            try { source.data = await this.minioGetObject(source.minioBucketName, source.minioObjName, source.type) }
            catch (error) {
                logger.error(error)
                process.res.sendStatus(404)
            }
        }

        if (dataModel.id && !dataModel.data) {
            try { dataModel.data = await DataModel.findOne({ _id: dataModel.id }) }
            catch (error) {
                logger.error(error)
                process.res.sendStatus(404)
            }
            dataModel.data = dataModel.data.dataModel
            dataModel.schema_id =
                //dataModel.data.$id || 
                config.modelSchemaFolder + '/DataModelTemp.json'
        }
        //let sourceFileTemp2 = false
        if (!source.data[0] && source.url) {
            source.download = await axios.get(source.url)
            source.data = source.download.data
            /*
            fs.writeFile(config.sourceDataPath + 'sourceFileTemp2.' + source.type, source.type == "csv" ? source.data : JSON.stringify(source.data), function (err) {
                if (err) throw err;
                logger.debug('File sourceData temp is created successfully.');
            })*/
            //sourceFileTemp2 = true
        }

        if (source.data) {
            fs.writeFile(config.sourceDataPath + 'sourceFileTemp.' + source.type, source.type == "csv" ? source.data : JSON.stringify(source.data), function (err) {
                if (err) throw err;
                logger.debug('File sourceData temp is created successfully.');
            })
        }

        if (source.data && source.path) source.data = source.data[source.path]

        if (dataModel.url) {
            dataModel.download = await axios.get(dataModel.url)
            dataModel.data = dataModel.download.data
        }

        if (dataModel.data) {
            logger.info(this.dataModelDeClean(dataModel.data))
            fs.writeFile(
                //dataModel.schema_id || 
                "dataModels/DataModelTemp.json", JSON.stringify(dataModel.data), function (err) {
                    if (err) throw err;
                    logger.debug('File dataModel temp is created successfully.');
                })
        }

        if (common.isMinioWriterActive())
            this.minioObj = { name: source.minioObjName, bucket: source.minioBucketName }

        try {
            await cli(
                //source.name ? config.sourceDataPath + source.name : config.sourceDataPath + sourceFileTemp2 ? 'sourceFileTemp2.' + source.type : 'sourceFileTemp.' + source.type,
                source.name ? config.sourceDataPath + source.name : config.sourceDataPath + 'sourceFileTemp.' + source.type,
                map,
                dataModel.name ? dataModel.name : dataModel.schema_id ? this.getFilename(dataModel.schema_id) : "DataModelTemp"
            );
        }
        catch (error) {
            logger.error(error)
            return error.toString()
        }
    },

    async getMinioObjectsFromBucket(bucket, prefix, format, sources) {//, postMessage) {
        let minioObjectList = await minioWriter.listObjects(bucket, undefined, undefined)//, postMessage)
        //sources.push(...minioObjectList)
        logger.debug(minioObjectList)
        for (let obj of minioObjectList) {
            if (obj.name.toLowerCase().includes(prefix) && !obj.name.toLowerCase().split(prefix)[0])
                try {
                    sources.push({ etag: obj.etag, from: "minio", bucket, name: obj.name, source: (await this.minioGetObject(bucket, obj.name, format)) })//, postMessage)) })
                }
                catch (error) {
                    logger.error(error)
                }
        }
    },

    async getAllSources(bucketName, prefix, format) {//, postMessage) {
        let sources = await Source.find()
        if (common.isMinioWriterActive())
            try {
                logger.debug(bucketName, prefix, format)
                await this.getMinioObjects(bucketName, prefix, format, sources)
            }
            catch (error) {
                logger.error("Unable to connect to minio")//TODO delete this try / catch and handle frontend side the error
            }
        return sources
    },

    async getSourcesFromDB() {
        return await Source.find()
    },

    async getMinioObjects(bucketName, prefix, format, sources) {
        if (!bucketName || Array.isArray(bucketName)) {
            let buckets = Array.isArray(bucketName) ? bucketName : await minioWriter.listBuckets()
            logger.debug(JSON.stringify(buckets))
            let totalBuckets = buckets.length
            let index = 0
            for (let bucket of buckets) {
                await this.getMinioObjectsFromBucket(bucket.name || bucket, prefix, format, sources)// postMessage)
                logger.debug((index++) + " - " + totalBuckets)
            }
        }
        else
            await this.getMinioObjectsFromBucket(bucketName, prefix, format, sources)
        return sources
    },

    async getMaps() {
        return await Map.find()
    },

    async getDataModels() {
        return await DataModel.find()
    },

    async getSource(id, name, mapRef) {
        let source = await Source.findOne(mapRef ? { mapRef: mapRef } : id ? { _id: id } : { name })
        if (!source) throw { code: 404, message: "NOT FOUND" }
        return source
    },

    async getMap(id, name) {
        let map = await Map.findOne(id ? { _id: id } : { name })
        if (!map) throw { code: 404, message: "NOT FOUND" }
        if (map.dataModel)
            map.dataModel = this.dataModelDeClean(map.dataModel)
        return map
    },

    async getDataModel(id, name, mapRef) {
        let dataModel = await DataModel.findOne(mapRef ? { mapRef: mapRef } : id ? { _id: id } : { name })
        if (!dataModel) throw { code: 404, message: "NOT FOUND" }
        dataModel.dataModel = this.dataModelDeClean(dataModel.dataModel)
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
            if (schema.properties) {
                schema.allOf[0].properties = { ...schema.allOf[0].properties, ...schema.properties }
                schema.properties = undefined
            }

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

    async insertSource(name, id, source, path, mapRef, bucket, prefix) {
        let insertedSource, map
        if (!source)
            throw { error: "source is required" }
        if (path == "")
            path = undefined
        if (mapRef) {
            map = (await Map.findOne({ name }))
            mapRef = map?._id
        }
        if ((mapRef || !await Source.findOne({ name })) && !await Source.findOne({ mapRef: mapRef.toString() })) {
            insertedSource = (await Source.insertMany([typeof source === 'string' ? {
                name: name,
                id: id,
                sourceCSV: source,
                mapRef: mapRef?.toString()
            } : {
                name: name,
                id: id,
                source: source,
                path,
                mapRef: mapRef?.toString()
            }]))[0]
            if (mapRef) {
                map.sourceDataID = insertedSource._id.toString()
                //map.sourceData = undefined
                logger.debug("INSERT SOURCE\n", map)
                await this.modifyMap(map.name, map._id, map.map, map.dataModel, map.status, map.description, undefined, undefined, insertedSource._id.toString(), undefined, undefined, map.dataModelIn, map.dataModelID, map.dataModelURL, map.config, map.sourceDataType, map.path, bucket, prefix)
                //logger.debug("INSERT SOURCE NEW MAP\n", await Map.findByIdAndUpdate(mapRef.toString(), { $unset: { sourceData: "" } }, map))
            }
            return insertedSource
        }
        throw { "error": "name already exists" }
    }, //TODO replace with insertOne

    async insertMap(name, id, map, dataModel, status, description,
        sourceData, sourceDataMinio, sourceDataID, sourceDataIn, sourceDataURL, dataModelIn, dataModelID, dataModelURL,
        mapConfig, sourceDataType, path, bucketName, prefix) {
        if (path == "")
            path = undefined
        if ((!dataModelIn && !dataModelID && !dataModelURL && !dataModel))
            throw { error: "schema is required" }
        if (dataModel)
            dataModel = this.dataModelClean(dataModel, {})
        let objectName = (
            //sourceDataMinio?.name || 
            (prefix + "/" + name)).replace(config.minioWriter.defaultInputFolderName, config.minioWriter.defaultOutputFolderName) //.toLowerCase()
        if (objectName.substring(objectName.length - 5) != ".json")
            objectName = objectName + ".json"

        let newMapper = {
            name: name,
            id: id,
            map: map,
            dataModel: dataModel,
            status: status,
            description: description,
            sourceData,
            sourceDataMinio,
            sourceDataID,
            sourceDataIn,
            sourceDataURL,
            dataModelIn,
            dataModelID,
            dataModelURL,
            config: mapConfig,
            sourceDataType,
            path
        }
        objectName = objectName.split("/")
        objectName[objectName.length - 1] = name
        let minioName = ""
        for (substring of objectName)
            minioName = minioName + "/" + substring
        minioName = minioName + ".json"
        await minioWriter.stringUpload(bucketName, minioName, JSON.stringify(newMapper))

        if (!await Map.findOne({ name })) {
            let insertedMap = await Map.insertMany([newMapper])
            if (sourceDataID)
                try {
                    await this.assignSource(sourceDataID, insertedMap._id)
                }
                catch (error) {
                    Map.deleteOne({ _id })
                    throw { error: "Error during source assignment" }
                }
            if (dataModelID)
                try {
                    await this.assignSchema(dataModelID, insertedMap._id)
                }
                catch (error) {
                    Map.deleteOne({ _id })
                    throw { error: "Error during schema assignment" }
                }
        }
        throw { "error": "name already exists" }
    },//TODO replace with insertOne

    async insertDataModel(name, id, dataModel, mapRef, bucket, prefix) {
        let insertedDataModel, map
        if (!dataModel)
            throw { error: "schema is required" }
        if (dataModel) dataModel = this.dataModelClean(dataModel, {})
        //if (typeof mapRef == "string")
        //    mapRef = (await Map.findOne({ name }))?._id
        if (mapRef) {
            map = await Map.findOne({ name })
            mapRef = map?._id
        }
        if ((mapRef || !await DataModel.findOne({ name })) && !await DataModel.findOne({ mapRef: mapRef.toString() })) {
            insertedDataModel = (await DataModel.insertMany([{ name: name, id: id, dataModel: dataModel, mapRef: mapRef?.toString() }]))[0]
            if (mapRef) {
                //map.dataModelID = insertedDataModel._id.toString()
                //map.dataModel = undefined
                //logger.debug("INSERT SCHEMA NEW MAP PUT\n", await Map.findByIdAndUpdate(mapRef.toString(), { $unset: { dataModel: "" } }, { dataModelID: insertedDataModel._id.toString() }))
                await this.modifyMap(map.name, map._id, map.map, undefined, map.status, map.description, map.sourceData, map.sourceDataMinio, map.sourceDataID, map.sourceDataIn, map.sourceDataURL, undefined, insertedDataModel._id.toString(), undefined, map.config, map.sourceDataType, map.path, bucket, prefix)
                logger.debug("INSERT SCHEMA NEW MAP GET\n", await Map.findById(mapRef.toString()))

            }
            return insertedDataModel
        }
        throw { "error": "name already exists" }
    },//TODO replace with insertOne

    async modifySource(name, id, source, path, mapRef, bucket, prefix) {
        let insertedSource, map
        if (!source)
            throw { error: "source is required" }
        if (path == "") path = undefined
        if (mapRef) {
            map = (await Map.findOne({ name }))
            mapRef = map?._id.toString()
        }
        insertedSource = await Source.findOneAndReplace(mapRef ? { mapRef } : { name }, typeof source === 'string' ? { name: name, id: id, sourceCSV: source, mapRef: mapRef?.toString() } : { name: name, id: id, source: source, path: path, mapRef: mapRef?.toString() })
        if (mapRef) {
            //map.sourceDataID = insertedSource._id.toString()
            //map.sourceData = undefined
            await this.modifyMap(map.name, map._id, map.map, map.dataModel, map.status, map.description, undefined, undefined, insertedSource._id.toString(), undefined, undefined, map.dataModelIn, map.dataModelID, map.dataModelURL, map.config, map.sourceDataType, map.path, bucket, prefix)
        }
        return insertedSource
    },

    async assignSource(id, mapRef) {

        if (!id || !mapRef)
            throw { error: "id or mapRef not specified" }
        let source = await Source.findById(id)
        if (!source)
            throw { error: "No source found" }
        if (source.mapRef == mapRef)
            return "Map already own this source"
        if (!source.isAlsoReferencedBy)
            source.isAlsoReferencedBy = [mapRef]
        else
            source.isAlsoReferencedBy.push(mapRef)
        return await source.save()
    },

    async deAssignSource(id, mapRef) {

        if (!id || !mapRef)
            throw { error: "id or mapRef not specified" }
        let source = await Source.findById(id)
        if (!source)
            return logger.warn({ warning: "No source found" })
        if (!source.isAlsoReferencedBy)
            return await Source.findOneAndReplace({ _id: id }, { $unset: { [mapRef]: 1 } })
        return await Source.findOneAndReplace({ _id: id }, { $pull: { isAlsoReferencedBy: mapRef } })
    },

    async assignSchema(id, mapRef) {
        if (!id || !mapRef)
            throw { error: "id or mapRef not specified" }
        let schema = await DataModel.findById(id)
        if (!schema)
            throw { warning: "No schema found" }
        if (schema.mapRef == mapRef)
            return "Map already own this schema"
        if (!schema.isAlsoReferencedBy)
            schema.isAlsoReferencedBy = [mapRef]
        else
            schema.isAlsoReferencedBy.push(mapRef)
        return await schema.save()
    },

    async deAssignSchema(id, mapRef) {
        if (!id || !mapRef)
            throw { error: "id or mapRef not specified" }
        let dataModel = await DataModel.findById(id)
        if (!dataModel)
            return logger.warn({ warning: "No schema found" })
        if (!dataModel.isAlsoReferencedBy)
            return await DataModel.findOneAndReplace({ _id: id }, { $unset: { [mapRef]: 1 } })
        return await DataModel.findOneAndReplace({ _id: id }, { $pull: { isAlsoReferencedBy: mapRef } })
    },

    call: 0,

    dataModelClean(dataModel, dataModelCleaned) {
        this.call++;
        for (let key in dataModel)
            if (Array.isArray(dataModel[key]))
                dataModelCleaned[key] = this.dataModelClean(dataModel[key], dataModelCleaned[key] || [])
            else if (typeof dataModel[key] == "object")
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
        //logger.debug(this.call)
        for (let key in dataModel) {
            //logger.debug(key)
            if (Array.isArray(dataModel[key]) || typeof dataModel[key] == "object")
                dataModel[key] = this.dataModelDeClean(dataModel[key])
            else if (key.startsWith("dollar")) {
                dataModel["$" + key.substring(6)] = dataModel[key]
                dataModel[key] = undefined
            }
        }
        return dataModel
    },

    async modifyMap(name, id, map, dataModel, status, description, sourceData, sourceDataMinio, sourceDataID, sourceDataIn, sourceDataURL, dataModelIn, dataModelID, dataModelURL,
        mapConfig, sourceDataType, path, bucketName, prefix) {

        //if (dataModel && dataModel.$schema)
        //    dataModel.schema = dataModel.$schema

        //if (dataModel && dataModel.$id)
        //    dataModel.id = dataModel.$id

        //if (dataModel) dataModel.$schema = dataModel.$id = undefined

        if ((!dataModelIn && !dataModelID && !dataModelURL && !dataModel))
            throw { error: "schema is required" }

        if (path == "") path = undefined

        if (dataModel) dataModel = this.dataModelClean(dataModel, {})
        let objectName = (
            //sourceDataMinio?.name || 
            (prefix + "/" + name)).replace(config.minioWriter.defaultInputFolderName, config.minioWriter.defaultOutputFolderName) //.toLowerCase()
        if (objectName.substring(objectName.length - 5) != ".json")
            objectName = objectName + ".json"

        let newMapper = {
            name: name,
            id: id,
            map: map,
            dataModel: dataModel,
            status: status,
            description: description,
            sourceData,
            sourceDataMinio,
            sourceDataID,
            sourceDataIn,
            sourceDataURL,
            dataModelIn,
            dataModelID,
            dataModelURL,
            config: mapConfig,
            sourceDataType,
            path
        }
        objectName = objectName.split("/")
        objectName[objectName.length - 1] = name
        let minioName = ""
        for (substring of objectName)
            minioName = minioName + "/" + substring
        minioName = minioName + ".json"
        await minioWriter.stringUpload(bucketName, minioName, JSON.stringify(newMapper))
        let oldMap = await Map.findOneAndReplace({ name }, newMapper)
        logger.debug(oldMap)
        if (oldMap.sourceDataID)
            await this.deAssignSource(oldMap._id)
        if (oldMap.dataModelID)
            await this.deAssignSchema(oldMap._id)
        return oldMap
    },

    async modifyDataModel(name, id, dataModel, mapRef, bucket, prefix) {
        let insertedDataModel, map
        if (!dataModel)
            throw { error: "schema is required" }
        dataModel = this.dataModelClean(dataModel, {})
        if (mapRef) {
            map = (await Map.findOne({ name }))
            mapRef = map?._id.toString()
        }
        insertedDataModel = await DataModel.findOneAndReplace(mapRef ? { mapRef } : { name }, { name: name, id: id, dataModel: dataModel, mapRef: mapRef.toString() })
        if (mapRef) {
            map.dataModelID = insertedDataModel._id.toString()
            //map.dataModel = undefined
            await this.modifyMap(map.name, map._id, map.map, undefined, map.status, map.description, map.sourceData, map.sourceDataMinio, map.sourceDataID, map.sourceDataIn, map.sourceDataURL, undefined, insertedDataModel._id.toString(), undefined, map.config, map.sourceDataType, map.path, bucket, prefix)
        }
        return insertedDataModel
    },

    async deleteSource(id, name) {
        let source = await DataModel.findOne(id ? { _id: id } : { name })
        if (source.mapRef)
            throw { code: 400, message: "BAD REQUEST.\nResource has a mapRef. Delete the mapper record who reference it before." }
        return await Source.deleteOne(id ? { _id: id } : { name })
    },

    async deleteMap(id, name) {

        let mapRef
        if (!id)
            mapRef = (await Map.findOne({ name }))._id
        let map = await Map.findOne(id ? { _id: id } : { name })
        let deletion = await Map.deleteOne(id ? { _id: id } : { name })
        //if (map.sourceDataID) {
        let source = await Source.findOne({ mapRef: (id || mapRef) })
        if (source?.isAlsoReferencedBy[0]) {
            source.mapRef = source.isAlsoReferencedBy.shift()
            logger.debug(source)
            await source.save()
        }
        else
            await Source.deleteOne({ mapRef: (id || mapRef) })
        //}
        //if (map.dataModelID) {
        let dataModel = await DataModel.findOne({ mapRef: (id || mapRef) })
        if (dataModel?.isAlsoReferencedBy[0]) {
            dataModel.mapRef = dataModel.isAlsoReferencedBy.shift()
            logger.debug(dataModel)
            await dataModel.save()
        }
        else
            await DataModel.deleteOne({ mapRef: (id || mapRef) })
        //}
        if (deletion.deletedCount)
            return deletion
        throw { code: 404, message: "NOT FOUND" }

    },

    async deleteDataModel(id, name) {
        let dataModel = await DataModel.findOne(id ? { _id: id } : { name })
        if (dataModel.mapRef)
            throw { code: 400, message: "BAD REQUEST.\nResource has a mapRef. Delete the mapper record who reference it before." }
        return await DataModel.deleteOne(id ? { _id: id } : { name })
    },

    async getLogs(from, to) {
        let logs = from && to ?
            await Log.find({ timestamp: { $gte: parseInt(from), $lte: parseInt(to) } }) :
            from ?
                await Log.find({ timestamp: { $gte: parseInt(from) } }) :
                to ?
                    await Log.find({ timestamp: { $lte: parseInt(to) } }) :
                    await Log.find()
        let stringifiedLogs = ""
        //return logs
        for (let log of logs) {
            stringifiedLogs += log.messages
            //console.debug(log.timestamp)
            //console.debug(Date.now()-log.timestamp)
        }
        return stringifiedLogs
    }
}