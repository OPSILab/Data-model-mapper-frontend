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

    sendBadRequest(){
        process.res.send(400)
        return "no source file"
    },

    async mapData(sourceData, mapPath, dataModel, sourceDataIn, sourceDataID, mapPathIn, dataModelIn, delimiter) {
        const cli = require('../../../cli/setup');

        process.env.delimiter = delimiter
        if (!sourceDataIn && sourceData) {
            await fs.writeFile(config.sourceDataPath + 'sourceFileTemp.' + sourceData[1], sourceData[1] == "csv" ? sourceData[0] : JSON.stringify(sourceData[0]), function (err) {
                if (err) throw err;
                console.log('File sourceData temp is created successfully.');
            })
        }
        if (!dataModelIn) {
            await fs.writeFile(dataModel[1], JSON.stringify(dataModel[0]), function (err) {
                if (err) throw err;
                console.log('File dataModel temp is created successfully.');
            })
        }
        await cli(
            sourceDataIn ? config.sourceDataPath + sourceData :
            sourceDataID ? await Source.findOne({name : sourceData}) : 
            sourceData ? config.sourceDataPath + 'sourceFileTemp.' + sourceData[1] : this.sendBadRequest(), 
            mapPath,
            !dataModelIn ? this.getFilename(dataModel[0].$id) : dataModel
        );
    },

    async insertSource(name,source) {
        return await Source.insertMany([typeof source === 'string' ? { name : name, sourceCSV: source } : { name : name, source: source }])
    },
    async insertMap(name, map) {
        return await Map.insertMany([{name : name, map: map }])
    },
    async insertDataModel(name, dataModel) {
        return await DataModel.insertMany([{name : name, dataModel : dataModel}])
    },
}