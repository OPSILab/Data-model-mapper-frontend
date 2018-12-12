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

var promises = [];

const processSource = async (sourceData, sourceDataType, mapData, dataModelSchemaPath) => {

    if (dataModelSchemaPath && mapData) {

        if (sourceData) {

            if (typeof sourceData === 'string') {

                sourceData = utils.parseFilePath(sourceData);
                var extension = sourceData.ext;
                if (!extension) {
                    // No file path provided nor dataType
                    log.error('The provided url/file path does not have file extension');
                    return Promise.reject('The provided url / file path does not have file extension');
                }

            } else if (!sourceDataType) {
                // No file path provided nor dataType
                log.error('No file path provided nor dataType');
                return Promise.reject('No file path provided nor dataType');
            }

            if (typeof mapData === 'string') {
                mapData = utils.parseFilePath(mapData);
            }

            try {
                // Load Data Model Schema from url or local file
                var loadedSchema = await schemaHandler.parseDataModelSchema(dataModelSchemaPath);

                log.info('Data Model Schema loaded and dereferenced');

                try {
                    // Load Map form file/url or directly as object
                    var map = await mapHandler.loadMap(mapData);

                } catch (error) {
                    log.error('There was an error while loading Map: ' + error);
                    return Promise.reject('There was an error while loading Map: ' + error);
                }


                if (map) {
                    log.info('Map loaded');
                    log.info('Starting to Map Source Object');

                    switch (extension || sourceDataType.toLowerCase()) {

                        case '.csv':
                        case 'csv':
                            csvParser.sourceDataToRowStream(sourceData, map, loadedSchema, processRow, processMappedObject, finalizeProcess);
                            break;
                        case '.json':
                        case 'json':
                            jsonParser.sourceDataToRowStream(sourceData, map, loadedSchema, processRow, processMappedObject, finalizeProcess);
                            break;
                        case '.geojson':
                        case 'geojson':
                            geoParser.sourceDataToRowStream(sourceData, map, loadedSchema, processRow, processMappedObject, finalizeProcess);
                            break;
                        default:
                            break;
                    }

                    return Promise.resolve("OK");

                } else {
                    log.error('There was an error while loading Map File: ' + error.stack);
                    return Promise.reject('There was an error while loading Map File');
                }

            } catch (error) {
                log.error('There was an error while processing Data Model schema: ' + error.stack);
                return Promise.reject(error);
            }

        } else {
            log.error('The source Data is not a valid file nor a valid path/url: ' + error.stack);
            return Promise.reject('The source Data is not a valid file nor a valid path/url');
        }

    } else if (!dataModelSchemaPath) {
        log.error('Data Model Schema path not specified');
        return Promise.reject('Data Model Schema path not specified');
    } else {
        log.error('Map path not specified');
        return Promise.reject('Map path not specified');
    }

};


const processRow = (rowNumber, row, map, schema, mappedHandler) => {

    /** If any, extract site, service and group for Id Pattern from Map
     * otherwise use the ones initialized in the Global Vars 
     **/
    let site, service, group;
    site = map['idSite'] || process.env.idSite;
    service = map['idService' || process.env.idService];
    group = map['idGroup'] || process.env.idGroup;
    delete map['idSite'];
    delete map['idService'];
    delete map['idGroup'];

    var result = mapHandler.mapObjectToDataModel(rowNumber, utils.cleanRow(row), map, schema, site, service, group, config.entityNameField);

    log.debug("Row: " + rowNumber + " - Object mapped correctly ");
    mappedHandler(rowNumber, result, schema);

};


const processMappedObject = async (objNumber, obj, modelSchema) => {

    config.writers.forEach((writer) => {
        switch (writer) {

            case 'orionWriter':
                promises.push(orionWriter.writeObject(objNumber, obj, modelSchema));
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