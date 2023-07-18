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

// this function completes the compatibility with array inside nested objects and objects inside an array
function nestedFieldsHandler(field, model) {
    log.silly("start function nestedFieldsHandler\n" + field)
    if (typeof field === "object") {
        log.silly("field is an object")
        for (let subField in field) {
            log.silly("iterating inside field:\n" + field)
            log.silly("iterating inside field: element found: \n" + subField)
            if (model) field[subField] = nestedFieldsHandler(field[subField],
                model[subField] ?
                    model[subField].properties ?
                        model[subField].properties
                        :
                        model[subField].items ?
                            model[subField].items
                            :
                            model[subField].type ?
                                model[subField].type
                                :
                                model[subField]
                    :
                    model
            )
            else return field
            log.silly("iterating inside field: finish. Now field is:\n" + field)
        }
    }
    else if (field && (field[0] == "[")) {
        if (field[1] == "{") {
            log.silly("field is not an object but an array of objects\n" + field)
            while (field.replaceAll("{ ", '{') != field) field = field.replaceAll("{ ", '{')
            while (field.replaceAll(" {", '{') != field) field = field.replaceAll(" {", '{')
            while (field.replaceAll("} ", '}') != field) field = field.replaceAll("} ", '}')
            while (field.replaceAll(" }", '}') != field) field = field.replaceAll(" }", '}')
            while (field.replaceAll(" : ", ':') != field) field = field.replaceAll(" : ", ':')
            while (field.replaceAll(", ", ',') != field) field = field.replaceAll(", ", ',')
            field = field.replaceAll("{", '{"');
            field = field.replaceAll("}", '"}');
            field = field.replaceAll(",", '","');
            field = field.replaceAll(":", '":"');
            try { field = JSON.parse(field) }
            catch (error) {
                console.log(error.message)
                field = field.replaceAll('}","{', '},{');
                while (field.replaceAll('" ', '"') != field) field = field.replaceAll('" ', '"') 
                while (field.replaceAll(' "', '"') != field) field = field.replaceAll(' "', '"') 
                while (field.replaceAll('":"{', '":{') != field) field = field.replaceAll('":"{', '":{'); 
                while (field.replaceAll('}"', '}') != field) field = field.replaceAll('}"', '}'); 
                //field = field.replaceAll('\"', '"');
                field = JSON.parse(field)
            }
        }
        else if (model.type === 'number' || model.type === 'integer') field = JSON.parse(field)
        else field = field.substring(1, field.length - 1).split(',')
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

        var rootProperties

        if (schema.allOf) {
            rootProperties = schema.allOf.pop().properties;

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
        }
        else rootProperties = schema.properties
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

    try { 
        if (schema.schema == "http://json-schema.org/draft-04/schema#") schema.schema = "http://json-schema.org/schema#"
        if (schema.$schema == "http://json-schema.org/draft-04/schema#") schema.$schema = "http://json-schema.org/schema#"
        var validate = ajv.compile(schema); 
    } catch (error) { 
        if (schema.anyOf && schema.anyOf[0]==undefined && !isSingleField) schema.anyOf = undefined;
        console.log(error); 
        console.log(schema) 
        var validate = ajv.compile(schema); 
    }
    var valid = validate(data);
    if (valid) log.info("Field is valid")
    else {
        try{
            data = nestedFieldsHandler(data, schema.allOf[0].properties)
        }
        catch(error){
            console.log(error)
        }
        validate = ajv.compile(schema);
        valid = validate(data)
        if (valid) {
            log.info("Field is valid")
        }
        else {
            log.info("\n--------------------------------\n\nField is not valid\n--------------------------------\n\n")
            console.log(data)
        }
    }

    if (config.mode == "server") apiOutput.outputFile[rowNumber - 1] = data;
    //if (config.mode == "server") apiOutput.outputFile.push(data);

    // Recover the required field, if removed in case of single field
    if (isSingleField && (required || anyOf)) {
        schema.required = required;
        schema.anyOf = anyOf;
    }

    if (valid) {
        if (!isSingleField)
            log.log({
                level: 'silly',
                message: 'Validation successful for entity with id:' + data.id
            });

        return true;
    }
    else {

        log.info(`Source Row/Object number ${rowNumber} invalid: ${ajv.errorsText(validate.errors)}`);
        if (!isSingleField) {
            report.info(`Source Row/Object number ${rowNumber} invalid: ${ajv.errorsText(validate.errors)}`);
        }
        log.error("Field is not valid")
        return false
    }
}


module.exports = {
    validateSourceValue: validateSourceValue,
    parseDataModelSchema: parseDataModelSchema
};