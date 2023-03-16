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

const Ajv = require('ajv');
const http = require('http');
const fs = require('fs');
const startHttp = /http:\/\//g;
const RefParser = require('json-schema-ref-parser');

const log = require('./utils/logger').app(module);
const report = require('./utils/logger').report;
const config = require('../config')
const apiOutput = require('./server/api/services/service')

let fieldContainsArray = false;

// this function completes the compatibility with array inside nested objects and objects inside an array
function nestedFieldsHandler(field, model) {
    log.silly("start function nestedFieldsHandler\n" + field)
    if (typeof field === "object") {
        log.silly("field is an object")
        for (let subField in field) {
            log.silly("iterating inside field:\n" + field)
            log.silly("iterating inside field: element found: \n" + subField)
            field[subField] = nestedFieldsHandler(field[subField],model[subField].properties?model[subField].properties : model[subField].items? model[subField].items : model[subField].type ? model[subField].type : model[subField])
            log.silly("iterating inside field: finish. Now field is:\n" + field)
        }
    }
    else if (field && (field[0] == "[")) {
        fieldContainsArray = true;
        if (field[1] == "{") {
            log.silly("field is not an object but an array of objects\n" + field)
            field = field.replaceAll("^", '"');
            field = JSON.parse(field)
        }
        else {
            log.silly("field is not an object but an array\n" + field)
            console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\ type", model)
            if (model.type === 'string') {
                field = field.substring(1, field.length - 1).split(',')
                console.log(typeof field[0])
                console.log(typeof field[0])
                console.log(typeof field[0])
                console.log(typeof field[0])
                console.log(typeof field[0])
                console.log("typeof field[0]")
                console.log(typeof field[0])
                console.log(typeof field[0])
                console.log(typeof field[0])
                console.log(typeof field[0])
                console.log(typeof field[0])
                console.log(typeof field[0])

            }
            else {
                field = JSON.parse(field)
                console.log(typeof field[0],field[0])
                console.log(typeof field[0])
                console.log(typeof field[0])
                console.log(typeof field[0])
                console.log(typeof field[0])
                console.log(typeof field[0])

            }
          //  console.log("djfdkfjkdkdjfkd", typeof field[0])
            if (typeof field[0] === 'string'){
                log.debug("Array has string elements")
            }
            else if (typeof field[0] === 'number'){
                log.debug("Array has integer elements")
            }
            else {
                console.log(typeof field[0],typeof field[0],typeof field[0],typeof field[0])
                console.log(field[0],field[0],field[0],field[0])
                log.debug("Array has no string and no integer elements")
            }
        }
    }

    log.silly("end function nestedFieldsHandler\n" + field)
    return field
}

// Load JSON Schema either from file or url, depending on the scructure of passed path
//function loadDataModelSchema(path) {

//    if (startHttp.test(path)) {
//        loadDataModelSchemaFromUrl(path);
//    } else {
//        loadDataModelSchemaFromFile(path);
//    }

//}


//function loadDataModelSchemaFromFile(path) {

//    console.log('Loading Data Model Json Schema from File');
//    var map = fs.readFileSync(filename, 'utf8');
//    console.log('JSON Schema file loaded');
//    return JSON.parse(map);

//}


//function loadDataModelSchemaFromUrl(url) {
//    var schema;
//    console.log('Loading Data Model Json Schema from URL');
//    http.get('url', function (res) {
//        res.on('end', function (chunk) {
//            schema = ('BODY: ' + chunk);
//        });
//    });
//    console.log(schema);
//    console.log('Loading Data Model Json Schema from URL');
//    return JSON.parse(schema);
//}



async function parseDataModelSchema(schemaPath) {

    return RefParser.dereference(schemaPath).then((schema) => {

        var rootProperties = schema.allOf.pop().properties;

        for (var allOf of schema.allOf) {

            if (allOf.allOf) {
                // nested allOf 
                for (var nestedAllOf of allOf.allOf) {
                    let head = nestedAllOf.properties;
                    for (let key in head) {
                        rootProperties[key] = head[key];
                    }
                }
            } else if (allOf.properties) {
                let head = allOf.properties;
                for (let key in head) {
                    rootProperties[key] = head[key];
                }
            }
        }
        schema.allOf = new Array({ properties: rootProperties });

        return new Promise((resolve, reject) => {
            resolve(schema);
        });
    });

}


/* Validate the input JSON data against a provided JsonSchema
* If the input data isSingleField, removes from Schema the required part, 
* in order to check only that field and not if there are required fields
*/
function validateSourceValue(data, schema, isSingleField, rowNumber) {

    var ajv = new Ajv({ allErrors: true });
    var required = undefined;
    var anyOf = undefined;


    if (isSingleField) {
        required = schema.required;
        anyOf = schema.anyOf;
        schema.required = [];
        schema.anyOf = undefined;
    }

    var validate = ajv.compile(schema);
    var valid = validate(data);
    var valid2 = false;
    // valid3
    if (valid) log.info("Field is valid")
    else {
        //console.log(schema.allOf[0].properties)
        //cazzo
        let dataFixed = nestedFieldsHandler(data, schema.allOf[0].properties)
        var validate2 = ajv.compile(schema);
        valid2 = validate2(dataFixed)
        console.log("dataFixed")
        console.log(dataFixed)
        if (valid2) {
            log.info("Field is valid")
            data = dataFixed
        }
        /*
        else {
            //for (let i in data) data[i] = parseInt(data[i])
            var validate3 = ajv.compile(schema);
            data = nestedFieldsHandler(data, true)
            valid3 = validate3(data)
            if (valid3) log.info("Field is valid")
            else if (validate3.errors) console.log(validate3.errors)
            console.log("data")
            console.log(data)
            console.log("typeof data[0]")
            console.log(typeof data[0])
        }*/
    }
    //if (validate.errors) log.info("Nested fields handler needed")

    if (config.mode == "server") apiOutput.outputFile[rowNumber - 1] = data;
    //if (config.mode == "server") apiOutput.outputFile.push(data);

    // Recover the required field, if removed in case of single field
    if (isSingleField && (required || anyOf)) {
        schema.required = required;
        schema.anyOf = anyOf;
    }

    if (valid || valid2) {
        if (!isSingleField)
            log.log({
                level: 'silly',
                message: 'Validation successful for entity with id:' + data.id
            });

        return true;
    }
    else {
        //log.silly("data before nested fields handler" + data);
        //data = nestedFieldsHandler(data);
        //log.silly("data after nested fields handler" + data)

        //if (!fieldContainsArray) {
            log.info(`Source Row/Object number ${rowNumber} invalid: ${ajv.errorsText(validate.errors)}`);
            if (!isSingleField) {
                report.info(`Source Row/Object number ${rowNumber} invalid: ${ajv.errorsText(validate.errors)}`);
            }
            log.error("Field is not valid")
            return false
        //}
        fieldContainsArray = false;
        log.info("Field is valid")
        return true
    }
}


module.exports = {
    validateSourceValue: validateSourceValue,
    parseDataModelSchema: parseDataModelSchema
};