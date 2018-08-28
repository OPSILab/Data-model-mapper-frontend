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
const path = require('path');

var config = {

    env: 'debug',
    mode: 'commandLine',
    logLevel: 'debug',
    modelSchemaFolder: path.join(__dirname, "dataModels"),

    // Following related to Mapping MANDATORY inputs (source, map, data model).
	// Windows paths MUST use \\ path delimiters

    sourceDataPath: "C:\\path\\to\\inputFile.csv",
    mapPath: "C:\\path\\to\\mapFile.json",
    targetDataModel: "PointOfInterest",

    // Following is related to writers which will handle mapped objects. Possible values: fileWriter (soon), orionWriter
    writers: ["orionWriter"],

    // Following used for ID creation, following proposed Id pattern for Synchronicity NGSI Entities
    site: "SomeRZ",
    service: "SomeService",
    group: "CSV", // could be any value, CSV used to group all entities, for these site and service, coming from a CSV.
	
    // Following represents the reserved field name in the MAP file, whose value (string or string array ),
	// will represent one or more fields from which the entityName part of the resulting ID will be taken
	// It is recommended to not modify it :), just use in the map the default field "entitySourceId" as reserved for this purpose
	
    entityNameField: "entitySourceId",
	
    // (SOON) If the entityNameField is not specified in the map, the following indicates the default prefix of generated ID 
	// This will be concatenated with the row / object number. If empty, that prefix will be the source filename
    entityDefaultPrefix: "ds", 

    // Misc configurations for row ranges
    rowStart : 1000,
    rowEnd : 5000
};

config.orionWriter = {

    orionUrl: "https://orionUrl",
    orionAuthHeaderName: "Authorization", // SOON
    orionAuthToken: "", // SOON
    proxy: '', // SOON
    skipExisting: true, // If false, try to updated existing entities
    maxRetry: 3, // Max sends retry per entity
    parallelRequests: 30 // Do not touch
};

// SOON
config.fileWriter = {
    filePath: "./result.json"
};

module.exports = config;