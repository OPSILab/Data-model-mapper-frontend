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

var config = require("../../config.js");
process.env.hasFileWriter = false;

process.env.validCount = 0;
process.env.unvalidCount = 0;
process.env.orionWrittenCount = 0;
process.env.orionUnWrittenCount = 0;
process.env.orionSkippedCount = 0;
process.env.rowNumber = 0;
process.env.rowStart = process.env.rowStart | config.rowStart;
process.env.rowEnd = process.env.rowStart | config.rowEnd;



var promises = undefined;
var updatePromises = undefined;

function processSource(sourceDataPath, mapPath, dataModelSchemaPath) {

    if (dataModelSchemaPath && mapPath) {

        var extension = sourceDataPath.match(utils.extensionPattern);

        if (extension && extension.length === 1) {

            // Load Data Model Schema from url or local file
            schemaHandler.parseDataModelSchema(dataModelSchemaPath, function (schema) {
                //fs.writeFileSync("schema.out", JSON.stringify(schema, function replacer(key, value) { return value }));

                if (schema) {
                    log.info('Data Model Schema loaded and dereferenced');
                    var map = mapHandler.loadMapFile(mapPath);

                    if (map) {
                        log.info('Map loaded');
                        log.info('Starting to Map Source Object');
                        //promises = [];
                        //updatePromises = [];

                        switch (extension[0]) {

                            case '.csv':
                                csvParser.sourceDataPathToRowStream(sourceDataPath, map, schema, processRow, processMappedObject);
                                break;
                            case '.json':
                                jsonParser.sourceDataPathToRowStream(sourceDataPath, map, schema, processRow, processMappedObject);
                                break;
                            case '.geojson':
                                geoParser.sourceDataPathToRowStream(sourceDataPath, map, schema, processRow, processMappedObject);
                                break;
                            default:
                                break;
                        }











                    } else {
                        log.error('There was an error while loading Map File');
                    }
                } else {
                    log.error('There was an error while loading Data Model Schema');
                }

            });

        } else {
            log.error("The file in the input path/url has no valid extension");
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

async function processMappedObject(objNumber, obj, modelSchema) {
    //obj ? log.info(JSON.stringify(obj)) : log.info(obj);
    var promise = undefined;
    var updatePromise = undefined;

    config.writers.forEach((writers) => {
        switch (writers) {

            case 'orionWriter':
                promise = orionWriter.writeObjectPromise(objNumber, obj, modelSchema, updatePromise);
                break;
            //case 'fileWriter':
            //    fileWriter.writeObject(objNumber, obj, modelSchema);
            //    process.env.hasFileWriter = true;
            //    break;
            default:
                promise = utils.sleep(0);
                break;
        }
    });

    // Wait until all promises (defined and pushed in processMappedObject handler)
    await promise;
    await updatePromise;
    orionWriter.checkAndPrintFinalReport();


    }

function finalizeProcess() {
            console.log('SONO IN FINALIZE');
            //// Finalize file in case of using fileWriter
            if (process.env.hasFileWriter == 'true')
                fileWriter.finalize();

        }


module.exports = {
            processSource: processSource,
            finalizeProcess: finalizeProcess
        }