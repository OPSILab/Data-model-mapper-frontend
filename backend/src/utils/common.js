const config = require('../../config')
let logIndex = 0
const log = require('./logger')
const { Logger } = log
const logger = new Logger(__filename)
const proj4 = require('proj4');
const Terraformer = require('terraformer');
const TerraformerProj4js = require('terraformer-proj4js');
const axios = require('axios');

process.dataModelMapper.sleep = (ms, message) =>  {
    logger.info(message || "waiting")
    return new Promise(resolve => setTimeout(resolve, ms));
}

function     sleep(ms) {
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
    convertGeoJSON : convertGeoJSON
}