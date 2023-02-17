const fs = require('fs');

module.exports = {

    outputFile: [],

    getFilename(id) {

        for (let i = 0; i < id.length; i++) {
            if (id[i] == '/') id = id.substring(i+1, id.length)
            if (id[i] == '.') {
                id = id.substring(0, i)
                i = id.length
            }
        }
        return id;
    },

    async mapData(sourceData, mapPath, dataModel, sourceDataIn, mapPathIn, dataModelIn, delimiter) {
        const cli = require('../../../cli/setup');

        process.env.delimiter= delimiter
        if (!sourceDataIn) {
            await fs.writeFile('./examples/sourceFileTemp.' + sourceData[1], sourceData[1]=="csv"? sourceData[0] : JSON.stringify(sourceData[0]), function (err) {
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
            !sourceDataIn? 'examples\\sourceFileTemp.' + sourceData[1] : sourceData,
            mapPath,
            !dataModelIn ? this.getFilename(dataModel[0].$id) : dataModel
        );
    }
}