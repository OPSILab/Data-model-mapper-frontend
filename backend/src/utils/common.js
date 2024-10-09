const config = require('../../config')
let logIndex = 0
const log = require('./logger')
const { Logger } = log
const logger = new Logger(__filename)
const proj4 = require('proj4');
const Terraformer = require('terraformer');
const TerraformerProj4js = require('terraformer-proj4js');
const axios = require('axios');

process.dataModelMapper.sleep = (ms, message) => {
    logger.info(message || "waiting")
    return new Promise(resolve => setTimeout(resolve, ms));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

TerraformerProj4js(Terraformer, proj4);

async function loadEPSGDefinition(epsgCode) {
    const proj4String = (await axios.get(`https://epsg.io/${epsgCode}.proj4`)).data;
    proj4.defs(`EPSG:${epsgCode}`, proj4String);
    logger.debug(proj4String);
}

async function convertGeoJSON(inputGeoJSON, sourceEPSGCode) {
    //logger.debug("Converting geojson")
    try {
        if (!proj4.defs[`EPSG:${sourceEPSGCode}`]) {
            await loadEPSGDefinition(sourceEPSGCode);
        }
    } catch (error) {
        logger.error("Error during EPSG code load:", error);
        return null;
    }
    const geojson = new Terraformer.Primitive(inputGeoJSON);
    const convertedGeoJSON = geojson.toGeographic();
    return convertedGeoJSON;
}

module.exports = {

    async transformCoordinates(sourceEpsgCode, targetEpsgCode, data, key) {
        logger.debug("----------------------------------------------------------------------------")
        logger.debug(data)
        if (Array.isArray(data[0])){
            for (let i in data)
                data[i] = await this.transformCoordinates(sourceEpsgCode, targetEpsgCode, data[i], key)
            return data
        }
        else {
            let result = (await axios.get('https://api.maptiler.com/coordinates/transform/' + data[0] + ',' + data[1] + '.json', {
                params: {
                    key: key || 'g0y01TmlRNajMPkic9lG',
                    s_srs: sourceEpsgCode,
                    t_srs: targetEpsgCode
                },
                headers: {
                    'accept': '*/*',
                    'accept-language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Referer': 'https://epsg.io/',
                    'Referrer-Policy': 'strict-origin-when-cross-origin',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'cross-site'
                }
            })).data
            logger.debug(data)
            data = [
                result.results[0].x,
                result.results[0].y
            ]
            logger.debug(data)
            return data
        }
    },

    e(error) {
        logger.error(error)
        logger.error("error at " + error?.stack)
        let str = ""
        var util = require('util')
        for (let key in error) {
            try {
                str = str.concat("{\n", '"', key, '"', " : ", JSON.stringify(error[key]), "\n},\n")
            }
            catch (error) {
                str = str.concat("{\n", '"', key, '"', " : ", util.inspect(error[key]), "\n},\n")
            }
        }

        var fs = require('fs');

        fs.writeFile("./logs/errorLog" + JSON.stringify(logIndex) + ".json", "[" + str.substring(0, str.length - 1) + "]", function (err) {
            if (err) logger.error(err);
        })

        logIndex++

        return error
    },
    sleep(ms, message) {
        logger.info(message || "waiting")
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    isMinioWriterActive() {
        return config.writers.includes('minioWriter');
    },
    async finish(obj) {
        let logCounterFlag
        while (!obj.value) {
            await sleep(1)
            if (!logCounterFlag) {
                logCounterFlag = true
                sleep(1000).then(resolve => {
                    if (!obj.value)
                        logger.debug("waiting for value")
                    logCounterFlag = false
                })
            }
        }
        if (obj.value)
            return obj.value

    },
    convertGeoJSON: convertGeoJSON
}