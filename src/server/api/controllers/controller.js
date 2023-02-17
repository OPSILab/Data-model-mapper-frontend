const service = require("../services/service.js")
const config = require('../../../../config')
const log = require('../../../utils/logger').app(module);

module.exports = {

    mapData: async (req, res) => {

        process.res = res;
        await service.mapData(
            req.body.sourceDataIn ? req.body.sourceDataIn : [req.body.sourceData, req.body.sourceDataType],
            req.body.mapPathIn ? req.body.mapPathIn : [req.body.mapData, "mapData"],
            req.body.dataModelIn ? req.body.dataModelIn : [req.body.dataModel, req.body.dataModel.$id],
            req.body.sourceDataIn ? true : false,
            req.body.mapPathIn ? true : false,
            req.body.dataModelIn ? true : false,
            req.body.csvDelimiter || config.delimiter || ','
        )
        log.debug("service.mapData end");
    }
};