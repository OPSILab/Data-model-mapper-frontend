/*******************************************************************************
 * Data Model Mapper
 *  Copyright (C) 2019 Engineering Ingegneria Informatica S.p.A.
 *  
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *  
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 ******************************************************************************/

var JSONStream = require('JSONStream');
const request = require('request');
const fs = require('fs');
const utils = require('../utils/utils');
const log = require('../utils/logger')//.app(module);
const { Logger } = log
const logger = new Logger(__filename)
const report = require('../utils/logger').report;
const config = require('./../../config');
const proj4 = require('proj4');
const Terraformer = require('terraformer');
const TerraformerProj4js = require('terraformer-proj4js');
const axios = require('axios');
let EPSG_code

TerraformerProj4js(Terraformer, proj4);

async function loadEPSGDefinition(epsgCode) {
    const response = await axios.get(`https://epsg.io/${epsgCode}.proj4`);
    //if (response.status !== 200)
    //    throw new Error(`Error during EPSG code load ${epsgCode}`);
    const proj4String = response.data;
    proj4.defs(`EPSG:${epsgCode}`, proj4String);
    logger.debug(response.data);
}

async function convertGeoJSON(inputGeoJSON, sourceEPSGCode) {
    logger.debug(EPSG_code)
    logger.debug("Converting geojson")
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

async function checkCoordinates(row, sourceData) {
    //logger.debug(sourceData) //TODO all this conversion could be called in service.js
    if (!EPSG_code)
        EPSG_code = sourceData.crs?.properties?.name?.includes("EPSG") ?
            sourceData.crs.properties.name.split(":").pop() :
            4326
    logger.debug(EPSG_code)
    if (EPSG_code == 4326)
        return row
    return await convertGeoJSON(row, EPSG_code)
};


async function sourceDataToRowStream(sourceData, map, schema, rowHandler, mappedHandler, finalizeProcess) {

    // The source Data is the file content itself
    if (sourceData && !sourceData.ext) {

        /*EPSG_code = sourceData.crs?.properties?.name?.includes("EPSG") ?
            sourceData.crs.properties.name.split(":").pop() :
            4326
        logger.debug(EPSG_code)*/

        try {
            await fileToRowStream(sourceData, map, schema, rowHandler, mappedHandler, finalizeProcess);
        }
        catch (err) {
            logger.error('There was an error while getting buffer from source data: ');
            logger.error(err)
        }

    }

    // The source Data is the file URL
    else if (utils.httpPattern.test(sourceData.path))
        await urlToRowStream(sourceData, map, schema, rowHandler, mappedHandler, finalizeProcess);

    // The Source Data is the file path
    else if (sourceData.ext)
        await fileToRowStream(fs.createReadStream(sourceData.absolute), map, schema, rowHandler, mappedHandler, finalizeProcess);
    else
        logger.error("No valid Source Data was provided");

}

async function urlToRowStream(url, map, schema, rowHandler, mappedHandler, finalizeProcess) {

    var rowNumber = Number(config.rowNumber);
    var rowStart = Number(config.rowStart);
    var rowEnd = Number(config.rowEnd);

    request(url).pipe(JSONStream.parse('.*'))
        .on('error', function (err) {
            logger.error(err);
        })
        .on('header', function (columns) {
            //  logger.info('Columns: ' + columns);
        })
        .on('data', async function (data) {

            rowNumber++;
            config.rowNumber = rowNumber;
            // outputs an object containing a set of key/value pair representing a line found in the csv file.
            if (rowNumber >= rowStart && rowNumber <= rowEnd) {

                rowHandler(rowNumber, config.onlyEPSG4326 ? await checkCoordinates(row) : row, map, schema, mappedHandler);

            }
        })
        .on('column', function (key, value) {
            // outputs the column name associated with the value found
            // logger.info('#' + key + ' = ' + value);
        })
        .on('end', async function () {
            try {

                await finalizeProcess();
                logger.debug("urlToRowStream: request(url).pipe(geo.parse()).on(end)");
                await utils.printFinalReportAndSendResponse(log);
                await utils.printFinalReportAndSendResponse(report);
            } catch (error) {
                logger.error("Error While finalizing the streaming process: ");
                logger.error(error);
            }

        });
}


async function fileToRowStream(inputData, map, schema, rowHandler, mappedHandler, finalizeProcess) {

    var rowNumber = Number(config.rowNumber);
    var rowStart = Number(config.rowStart);
    var rowEnd = Number(config.rowEnd);

    await inputData.pipe(JSONStream.parse('.*'))
        .on('error', function (err) {
            logger.error(err);
        })
        .on('header', function (columns) {
            // logger.info(columns);
        })
        .on('data', async function (row) {
            rowNumber = Number(config.rowNumber) + 1;
            config.rowNumber = rowNumber;

            // outputs an object containing a set of key/value pair representing a line found in the csv file.
            if (rowNumber >= rowStart && rowNumber <= rowEnd) {

                rowHandler(rowNumber, config.onlyEPSG4326 ? await checkCoordinates(row, inputData) : row, map, schema, mappedHandler);

            }

        }).on('column', function (key, value) {
            // outputs the column name associated with the value found
            //logger.info('#' + key + ' = ' + value);
        })
        .on('end', async function () {

            await finalizeProcess();
            logger.debug("fileToRowStream: inputData.pipe(geo.parse()).on(end)");
            await utils.printFinalReportAndSendResponse(log);
            await utils.printFinalReportAndSendResponse(report);

        });

}

module.exports = {
    sourceDataToRowStream: sourceDataToRowStream
};