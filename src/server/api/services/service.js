const fs = require('fs');
const config = require('../../../../config')
const Source = require("../models/source.js")
const Map = require("../models/map.js")
const DataModel = require("../models/dataModel.js")

module.exports = {

    outputFile: [],

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

    async mapData(source, map, dataModel, delimiter) {
        const cli = require('../../../cli/setup');
        if (!source || !map || !dataModel) {
            process.res.send(400)
            return "no source file"
        }

        process.env.delimiter = delimiter

        if (source.id) {
            try{source.data = await Source.findOne({ id: source.id })}
            catch(error){process.res.send(404)}
            source.data = source.data.source || source.data.sourceCSV
        }

        if (map.id) {
            try{map = await Map.findOne({ id: map.id })}
            catch(error){process.res.send(404)}
            map = [map.map, "mapData"]
        }

        if (dataModel.id) {
            try {dataModel.data = await DataModel.findOne({ id: dataModel.id })}
            catch(error){process.res.send(404)}
            dataModel.data = dataModel.data.dataModel
            dataModel.schema_id = dataModel.data.$id || config.modelSchemaFolder + '/DataModelTemp.json'
        }

        if (source.data) {
            await fs.writeFile(config.sourceDataPath + 'sourceFileTemp.' + source.type, source.type == "csv" ? source.data : JSON.stringify(source.data), function (err) {
                if (err) throw err;
                console.log('File sourceData temp is created successfully.');
            })
        }
        if (dataModel.data) {
            await fs.writeFile(dataModel.schema_id, JSON.stringify(dataModel.data), function (err) {
                if (err) throw err;
                console.log('File dataModel temp is created successfully.');
            })
        }
        await cli(
            source.name ? config.sourceDataPath + source.name : config.sourceDataPath + 'sourceFileTemp.' + source.type,
            map,
            dataModel.name ? dataModel.name : this.getFilename(dataModel.schema_id)
        );
    },

    async insertSource(name, id, source) {
        return await Source.insertMany([typeof source === 'string' ? { name: name, id:id, sourceCSV: source } : { name: name, id:id, source: source }])
    },
    async insertMap(name, id, map) {
        return await Map.insertMany([{ name: name, id:id, map: map }])
    },
    async insertDataModel(name, id, dataModel) {
        return await DataModel.insertMany([{ name: name, id:id, dataModel: dataModel }])
    },
}