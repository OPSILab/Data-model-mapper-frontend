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

const fs = require('fs');
const config = require('../config');
const utils = require('./utils/utils.js');
const validator = require('./schemaHandler.js');
const unorm = require('unorm');
const staticPattern = /static:(.*)/;
const dotPattern = /(.*)\.(.*)/;

const log = require('./utils/logger').app;
const report = require('./utils/logger').report;

function loadMapFile(filename) {

    log.info('Loading Map File');
    try {
        var map = fs.readFileSync(filename, 'utf8');
        return JSON.parse(map);
    } catch (err) {
        log.error("Error while parsing Map File!: " + err);
        return undefined;
    }
}

// This function takes in input the source object, uses map object to map to a destination data Model
// according to the passed data model Json Schema
function mapObjectToDataModel(rowNumber, source, map, modelSchema, site, service, group, entityIdField) {

    var result = {};
    //var entityId = undefined;

    for (var destKey in map) {

        var mapSourceField = map[destKey];    // sourceField map object or key-value pair
        var singleResult = undefined;

        // If the destKey is entityIdField and has only "static:" fields, the pair value indicates only an ID prefix
        // The resulting string will be concatenated with rowNumber
        var isIdPrefix;

        //// If the map key has a . , it means that the source key is an object
        ////var dotPattern = /(.*)\.(.*)/g;
        //if (mapDestKey.test(dotPattern)){

        //    var extrFields = mapDestKey.match(dotPattern);
        //    // Check if there are other subfields for this object field
        //    if (extrFields.length > 1) {
        //  Check if destKey is present in modelSchema
        var modelSchemaDestKey = modelSchema.allOf[0].properties[destKey];
        if (modelSchemaDestKey || (destKey == entityIdField)) {

            // If the value of key-value maping pair is a function definition, eval it.
            //if ( (typeof mapSourceField == "string") && mapSourceField.startsWith("function")) {
            //    map[destKey] = utils.parseFunction(mapSourceField);

            // If the destination Key is a entityId field (according to definition in config.js)

            //if (destKey == entityIdField) {
            //    entityId = source[mapSourceField];
            //    delete map[destKey];

            //}
            // Convert the single source field from map, to the final mapped single object or key-value pair, to be validated
            // If valid, it is added to the final result object, otherwise is discarded

            // Normalize encoding, avoiding problems with fields name not recognized due to different source encoding
            var norm = JSON.parse(unorm.nfc(JSON.stringify(mapSourceField)));


            // If the value type of mapped field is different from string, try first to extract it
            var parsedNorm = {};

            // If destination Schema field is OneOf
            if (modelSchemaDestKey && !modelSchemaDestKey.type && modelSchemaDestKey.oneOf) {

                var oneOf = modelSchemaDestKey.oneOf;

                // If map is an object with coordinates it's a location type field or if is "geometry"
                if (destKey === 'location') {
                    if (norm.type && norm.coordinates && norm.type.startsWith('static:')) {

                        var parsedStaticType = norm.type.match(staticPattern)[1];
                        if (Array.isArray(oneOf) && oneOf.find(k => k.properties.type.enum.find(e => e == parsedStaticType))) {

                            parsedNorm['type'] = new Function("input", "return '" + parsedStaticType + "'");
                            parsedNorm['coordinates'] = new Function("input", "return " + "[Number(input['" + norm.coordinates[0] + "']),Number(input['" + norm.coordinates[1] + "'])]");

                        }
                    } else if (norm === 'geometry') {
                        parsedNorm = new Function("input", "return input['" + norm + "'];");
                    } else
                        continue;
                }
            } else if (modelSchemaDestKey && modelSchemaDestKey.type === 'object') {

                for (key in norm) {

                    var schemaField = modelSchemaDestKey.properties[key];
                    if (schemaField) {

                        var schemaFieldType = schemaField.type;
                        var schemaFieldFormat = schemaField.format;
                        var mapSourceSubField = norm[key];

                        parsedNorm[key] = {};
                        if (schemaFieldType === 'number' || schemaFieldType === 'integer') {
                            parsedNorm[key] = new Function("input", "return Number(input['" + mapSourceSubField + "']);");

                        } else if (schemaFieldType === 'string' && schemaFieldFormat === 'date-time') {
                            parsedNorm[key] = new Function("input", "return new Date(input['" + mapSourceSubField + "']).toISOString();");

                        } else if (schemaFieldType === 'string' && Array.isArray(mapSourceSubField)) {
                            parsedNorm[key] = new Function("input", "return " + handleSourceFieldsArray(mapSourceSubField).result);
                        } else if (schemaFieldType === 'string' && (typeof mapSourceSubField === 'string') && mapSourceSubField.startsWith("static:")) {
                            parsedNorm[key] = new Function("input", "return '" + mapSourceSubField.match(staticPattern)[1] + "'");
                        } else { // normal string no action required
                            parsedNorm[key] = mapSourceSubField;
                        }

                        // Add type to the nested map field
                        //parsedNorm[key]['type'] = new Function("input", "return '" + schemaFieldType + "'");
                    }
                }

            } else if (modelSchemaDestKey && modelSchemaDestKey.type === 'array' && Array.isArray(norm)) {

                parsedNorm = new Function("input", "return " + handleSourceFieldsToDestArray(norm));

            } else if (modelSchemaDestKey && (modelSchemaDestKey.type === 'number' || modelSchemaDestKey.type === 'integer')) {

                var num = source[norm];
                if (typeof num === 'string')
                    parsedNorm = new Function("input", "return Number(input['" + norm + "']);");
                else
                    parsedNorm = norm;

            }
            else if (modelSchemaDestKey && modelSchemaDestKey.type === 'string' && modelSchemaDestKey.format === 'date-time') {
                var a = handleDottedField(norm);
                var date = eval('source' + handleDottedField(norm));
                if (date === null || date === '')
                    continue;
                parsedNorm = new Function("input", "return new Date(input" + handleDottedField(norm) + ").toISOString();");
            }
            else if (modelSchemaDestKey && modelSchemaDestKey.type === 'string' && Array.isArray(norm))
                parsedNorm = new Function("input", "return " + handleSourceFieldsArray(norm).result);

            else if (modelSchemaDestKey && modelSchemaDestKey.type === 'string' && (typeof norm === 'string') && norm.startsWith("static:"))
                parsedNorm = new Function("input", "return '" + norm.match(staticPattern)[1] + "'");

            else if (destKey == entityIdField) {

                if (Array.isArray(norm)) {
                    var resIdFields = handleSourceFieldsArray(norm);
                    parsedNorm = new Function("input", "return " + resIdFields.result);
                    isIdPrefix = resIdFields.isOnlyStatic;
                }
                else if (norm.startsWith("static:"))
                    parsedNorm = new Function("input", "return '" + norm.match(staticPattern)[1] + "'");
                else
                    parsedNorm = norm;
            } else
                parsedNorm = norm;

            // Add type to map field
            //parsedNorm.type = new Function("input", "return '" + modelSchemaDestKey.type +"'");

            // Perform actual mapping
            var converter = require('json-mapper').makeConverter({ [destKey]: parsedNorm });
            singleResult = converter(source);

            // Check if mapping result is valid
            if (singleResult && ((destKey == entityIdField) || checkPairWithDestModelSchema(singleResult, destKey, modelSchema, rowNumber))) {

                // Additional processing of sourceValue (e.g. filtering or concatenation with other fields)
                // .....
                // Add the mapped singleResult and the destination key to result object

                result[destKey] = singleResult[destKey];

            } else {
                log.debug('Skipping source field: ' + JSON.stringify(mapSourceSubField) + ' because is not a valid value for mapped key: ' + destKey);
            }
        } else {
            log.info('The mapped key: ' + destKey + ' is not present in the selected Data Model Schema');
        }


    }


    // Append type field, according to the model Schema
    result.type = modelSchema.allOf[0].properties.type.enum[0];
    // Generate an unique id for the mapped object
    result.id = utils.createSynchId(result.type, site, service, group, result[entityIdField], isIdPrefix, rowNumber);
    delete result[entityIdField];
    // Once we added only valid mapped single entries, let's do a final validation against the whole final mapped object
    // Despite single validations, the following one is mandatory to be successful
    if (checkResultWithDestModelSchema(result, destKey, modelSchema)) {
        log.debug('Mapped object, number: ' + rowNumber + ' is compliant with target Data Model');
        report.info('Mapped object, number: ' + rowNumber + ' is compliant with target Data Model');
        process.env.validCount++;
        return result;
    } else {

        report.info('--------------------------------------------------------------------------------\n' +
            'Mapped object, number:' + rowNumber + ', id: ' + result.id + ' is not compliant with target Data Model! Skipping!\n' +
            JSON.stringify(result) +
            '\n--------------------------------------------------------------------------------\n');

        log.debug('Mapped object, number: ' + rowNumber + ', id: ' + result.id + ' is not compliant the target Data Model! Skipping!');
        process.env.unvalidCount++;
        return undefined;
    }

}

// This function takes in input the source value to be mapped with a destination object, coming from the Data Model Schema
// and checks if constraints present in the destination Model object are met by the source value
function checkPairWithDestModelSchema(mappedObject, destKey, modelSchema, rowNumber) {

    var result = validator.validateSourceValue(mappedObject, modelSchema, true, rowNumber);
    return result;

}

// This function takes in input the final whole mapped object and validate it against the destination Data Model Schema
function checkResultWithDestModelSchema(mappedObject, destKey, modelSchema) {

    return validator.validateSourceValue(mappedObject, modelSchema, false);

}

function handleSourceFieldsArray(sourceFieldArray) {

    var finalArray = [];
    var isOnlyStatic = true;
    // If value of string array startwith "static:" it is a static string to be concatenated,
    // not the name of the source field.
    sourceFieldArray.forEach(function (value, index, array) {

        var staticMatch = value.match(staticPattern);
        if (staticMatch && staticMatch.length > 0) {
            // filter forbidden characters
            var filterMatch = undefined;
            if (!(filterMatch = staticMatch[1].match(/^([^\(]*)(\((.*)\)|\n|<|>|"|'|=|;|\(|\))(.*)$/)))
                finalArray[index] = "'" + staticMatch[1] + "'";
            else if (filterMatch.length === 1)
                finalArray[index] = ' ';
            else if (filterMatch.length === 5)
                finalArray[index] = "'" + filterMatch[1] + (filterMatch[3] ? filterMatch[3] : "") + filterMatch[4] + "'";
            else
                finalArray[index] = "'" + filterMatch[1] + filterMatch[4] + "'";
        } else {

            isOnlyStatic = false;
            var splittedDot = value.match(dotPattern);

            if (splittedDot) {

                splittedDot.shift();
                if (splittedDot.length > 0) {
                    finalArray[index] = finalArray[index] = "input['" + splittedDot.join("']['") + "']";
                }

            } else {
                finalArray[index] = "input['" + value + "']";
            }
        }
    });

    return {
        result: finalArray.join(' + '),
        isOnlyStatic: isOnlyStatic
    };

};

function handleSourceFieldsToDestArray(sourceFieldArray) {

    var finalArray = [];
    var resultString = undefined;
    // If value of string array startwith "static:" it is a static string to be concatenated,
    // not the name of the source field.
    sourceFieldArray.forEach(function (value, index, array) {

        var staticMatch = value.match(staticPattern);
        if (staticMatch && staticMatch.length > 0) {

            finalArray[index] = staticMatch[1];

        } else {

            var splittedDot = value.match(dotPattern);

            if (splittedDot) {

                splittedDot.shift();
                if (splittedDot.length > 0)
                    finalArray[index] = "input['" + splittedDot.join("']['") + "']";

            } else {
                finalArray[index] = "input['" + value + "']";
            }
        }
    });

    // print Array String as output
    resultString = '[';
    finalArray.forEach(function (value, index) {
        if (value.startsWith("input")) {
            resultString += value + ',';

        } else { //static
            resultString += '"' + value + '",';
        }
    });
    
    resultString = resultString.slice(0, resultString.length - 1) + ']';
    return resultString;

}

// Returns array notation from dotten notation (without input)
function handleDottedField(fieldName) {

    var staticMatch = fieldName.match(staticPattern);
    if (staticMatch && staticMatch.length > 0) {

        finalArray[index] = staticMatch[1];

    } else {

        var splittedDot = fieldName.match(dotPattern);

        if (splittedDot) {

            splittedDot.shift();
            if (splittedDot.length > 0)
                return "['" + splittedDot.join("']['") + "']";

        } else {
            return "['" + fieldName + "']";
        }
    }
    
}

module.exports = {
    loadMapFile: loadMapFile,
    mapObjectToDataModel: mapObjectToDataModel
};