/*******************************************************************************
 * Data Model Mapper
 *  Copyright (C) 2018 Engineering Ingegneria Informatica S.p.A.
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

//'use strict';
const schemaHandler = require('../schemaHandler.js');
const mapHandler = require('../mapHandler.js');
const csvParser = require("../parsers/csvParser.js");
const geoParser = require("../parsers/geoJsonParser.js");
const jsonParser = require("../parsers/jsonParser.js");
const orionWriter = require("../writers/orionWriter");
const fileWriter = require("../writers/fileWriter");
const log = require('../utils/logger').app;
const utils = require('../utils/utils.js');
const config = require("../../config.js");

process.env.hasFileWriter = false;

process.env.validCount = 0;
process.env.unvalidCount = 0;
process.env.orionWrittenCount = 0;
process.env.orionUnWrittenCount = 0;
process.env.orionSkippedCount = 0;
process.env.fileWrittenCount = 0;
process.env.fileUnWrittenCount = 0;
process.env.rowNumber = 0;
process.env.rowStart = process.env.rowStart | config.rowStart;
process.env.rowEnd = process.env.rowStart | config.rowEnd;

var promises = [];

async function processSource(sourceData, sourceDataType, mapData, dataModelSchemaPath) {

    if (dataModelSchemaPath && mapData) {

        if (sourceData) {

            if (typeof sourceData === 'string') {

                sourceData = utils.parseFilePath(sourceData);
                var extension = sourceData.ext;
                if (!extension) {
                    // No file path provided nor dataType
                    log.error('The provided url/file path does not have file extension');
                    return;
                }

            } else if (!sourceDataType) {
                // No file path provided nor dataType
                log.error('No file path provided nor dataType');
                return;
            }

            if (typeof mapData === 'string') {
                mapData = utils.parseFilePath(mapData);
            }
            // Load Data Model Schema from url or local file
            schemaHandler.parseDataModelSchema(dataModelSchemaPath).then(async (schema) => {

                log.info('Data Model Schema loaded and dereferenced');

                var map = await mapHandler.loadMap(mapData).catch((err) => {
                    log.error('There was an error while loading Map');
                    throw new Error(err);
                });


                if (map) {
                    log.info('Map loaded');
                    log.info('Starting to Map Source Object');

                    switch (extension || sourceDataType) {

                        case '.csv':
                            csvParser.sourceDataPathToRowStream(sourceData, map, schema, processRow, processMappedObject, finalizeProcess);
                            break;
                        case '.json':
                            jsonParser.sourceDataPathToRowStream(sourceData, map, schema, processRow, processMappedObject, finalizeProcess);
                            break;
                        case '.geojson':
                            geoParser.sourceDataPathToRowStream(sourceData, map, schema, processRow, processMappedObject, finalizeProcess);
                            break;
                        default:
                            break;
                    }


                } else {
                    log.error('There was an error while loading Map File');
                }

            }).catch((error) => {

                log.error("There was an error while processing Data Model schema");
                throw new Error(error);
            });


        } else {
            log.error("The source Data is not a valid file nor a valid path/url");
        }

    } else if (!dataModelSchemaPath) {
        log.error('Data Model Schema path not specified');
    } else {
        log.error('Map path not specified');
    }

}


function processRow(rowNumber, row, map, schema, mappedHandler) {

    var result = mapHandler.mapObjectToDataModel(rowNumber, utils.cleanRow(row), map, schema, config.site, config.service, config.group, config.entityNameField);

    log.debug("Row: " + rowNumber + " - Object mapped correctly ");
    mappedHandler(rowNumber, result, schema);

}

const processMappedObject = async (objNumber, obj, modelSchema) => {

    config.writers.forEach((writer) => {
        switch (writer) {

            case 'orionWriter':
                promises.push(orionWriter.writeObjectPromise(objNumber, obj, modelSchema));
                break;
            case 'fileWriter':
                promises.push(fileWriter.writeObject(objNumber, obj, config.fileWriter.addBlankLine));
                break;
            default:
                promises.push(utils.sleep(0));
                break;
        }
    });
};

const finalizeProcess = async () => {
    await Promise.all(promises);

    // Wait until all promises resolve (defined and pushed in processMappedObject handler)
    if (utils.isFileWriterActive()) {
        await fileWriter.finalize(); // Finalize file in case of using fileWriter
        fileWriter.checkAndPrintFinalReport();
    }

    if (utils.isOrionWriterActive()) {
        orionWriter.checkAndPrintFinalReport();
    }
    return Promise.resolve();
};


module.exports = {
    processSource: processSource
};