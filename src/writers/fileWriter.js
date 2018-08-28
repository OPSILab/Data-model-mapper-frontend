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

var fs = require('fs');
const log = require('../utils/logger').app;
const config = require('../../config');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function writeObject(objNumber, obj, modelSchema) {

    if (obj && config.fileWriter.filePath) {
        log.debug('Writing to file, object number: ' + objNumber + ' , id: ' + obj.id);


        // var orionedObj = toOrionObject(obj, modelSchema);

        if (fs.existsSync(config.fileWriter.filePath)) {

            try {
                fs.appendFileSync(config.fileWriter.filePath, ',\n' + JSON.stringify(obj));
                log.debug('Entity Number: ' + objNumber + ' with Id: ' + obj.id + ' correctly written to file');
            } catch (err) {
                log.debug('Error while writing mapped object to file');
                log.debug('----------------------------------------------------------\n' +
                    'Entity Number: ' + objNumber + ' with Id: ' + obj.id + ' NOT written to file');
            }

        } else {
            fs.writeFileSync(config.fileWriter.filePath, "[" + JSON.stringify(obj));
        }

    } else {
        log.debug("Mapped Object is undefined!, nothing to write to file");
    }
}

function finalizeFile() {
    if (fs.existsSync(config.fileWriter.filePath))
        fs.appendFileSync(config.fileWriter.filePath, "]");
}

function toOrionObject(obj, schema) {

    log.debug("Transforming Mapped object to an Orion Entity (explicit types in attributes)");

    for (key in obj) {
        if (key != 'id' && key != 'type') {

            var modelField = schema.allOf[0].properties[key];
            var modelFieldType = modelField.type;
            var modelFieldFormat = modelField.format;
            var objField = obj[key];

            if (key == 'location') {

                var newValue = {};
                newValue = {
                    type: "geo:json",
                    value: objField
                };
                obj['location'] = newValue;

            } else if (modelFieldType === 'object') {

                //var nestedValue = {};
                //for (fieldKey in objField) {

                //    var modelSubField = modelField.properties[fieldKey];
                //    var modelSubFieldType = modelSubField.type;
                //    var modelSubFieldFormat = modelSubField.format;

                //    if (modelSubFieldFormat)
                //        nestedValue[fieldKey] = {
                //            value: objField[fieldkey],
                //            type: modelSubFieldType,
                //            format: modelSubFieldFormat
                //        }
                //    else
                //        nestedValue[fieldKey] = {
                //            value: objField[fieldKey],
                //            type: modelSubFieldType
                //        }

                //    delete objField[fieldKey];
                //}

                var nestedObject = objField;
                delete objField;
                obj[key] = {
                    type: modelFieldType,
                    value: nestedObject
                }

            } else {

                if (modelFieldFormat)
                    obj[key] = {
                        type: modelFieldType,
                        value: objField,
                        format: modelFieldFormat
                    }
                else
                    obj[key] = {
                        type: modelFieldType,
                        value: objField
                    }
            }
        }
    }

    return obj;
}


module.exports = {
    writeObject: writeObject,
    finalize: finalizeFile
}