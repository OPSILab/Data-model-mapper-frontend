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

const config = require('../../config');

const extensionPattern = /\.[0-9a-z]+$/i;
const httpPattern = /http:\/\//g;
const filenameFromPathPattern = /^(.:)?\\(.+\\)*(.+)\.(.+)$/;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function cleanString(string) {
    var result = '';
    if (typeof string === 'string')
        result = string.replace(/\n|'|<|>|"|'|=|;|\(|\)/g, ' ');

    return result;

}

function cleanIdString(string) {
    var result = '';
    if (typeof string === 'string')
        result = string.replace(/\n|'|<|>|"|'|=|;|\(|\)/g, ' ')
            .replace(/à/g, 'a')
            .replace(/ù/g, 'u')
            .replace(/é|è/g, 'e')
            .replace(/ò/g, 'o');

    return result;
}


function cleanNumber(number) {
    return number;
}

function cleanPair(key, value) {


    if (value instanceof Array) {
        var arrayResult = {};
        var arrayValues = [];
        for (var i = 0; i < value.length; i++) {
            var elem = value[i];
           
            arrayValues[i] = cleanPair(key, elem).value;
        }
        arrayResult.key = cleanString(key);
        arrayResult.value = arrayValues;
        return arrayResult;

    } else if (value !== null && typeof value === 'object') {
        var result = {};
        var objResult = {};
        Object.keys(value).forEach(function (objKey) {
            var aux = cleanPair(objKey, value[objKey]);
            objResult[aux.key] = aux.value;
        });
        result.key = cleanString(key);
        result.value = objResult;
        return result;

    } else {

        var result = {};
        result.key = cleanString(key);
        if (typeof value === 'string')
            result.value = cleanString(value);
        else if (value !== null) {
            result.value = cleanNumber(value);
        }
        else
            result.value = '';
            
        return result;
    }
}

function cleanRow(row) {

    var result = {};

    Object.keys(row).forEach(function (key) {
        var value = row[key];
        var newPair = cleanPair(key, value);
        result[newPair.key] = newPair.value;
    });

    return result;
}

function uuid() {
    var uuid = "", i, random;
    for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;

        if (i == 8 || i == 12 || i == 16 || i == 20) {
            uuid += "-"
        }
        uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
}


/** Create Final SynchroniCity id, according to defined Id Pattern
 * 
 *  If the entityName is not empty
 *     if it isIdPrefix, concatenate entityName with rowNumber
 *     else use only EntityName (should have a mapped unique value)
 *  else
 *     use as entityName the sourcefilename + rowNumber
 * 
 * 
 **/
function createSynchId(type, site, service, group, entityName, isIdPrefix, rowNumber) {

    if (entityName) {
        if (isIdPrefix)
            entityName = entityName.replace(/\s/g, "") + "-" + rowNumber;
        else
            entityName = entityName.replace(/\s/g, "");
    } else {
        entityName = extractFilenameFromPath(config.sourceDataPath.replace(/\s/g, "") + "-" + rowNumber);
    }

    // Group field is optional
    return "urn:ngsi-ld:" + type + ":" + site + ":" + service + (group ? (":" + group) : "") + ":" + cleanIdString(entityName);
}


function parseFunction(str) {
    var fn_body_idx = str.indexOf('{'),
        fn_body = str.substring(fn_body_idx + 1, str.lastIndexOf('}')),
        fn_declare = str.substring(0, fn_body_idx),
        fn_params = fn_declare.substring(fn_declare.indexOf('(') + 1, fn_declare.lastIndexOf(')')),
        args = fn_params.split(',');

    args.push(fn_body);

    function Fn() {
        return Function.apply(this, args);
    }
    Fn.prototype = Function.prototype;

    return new Fn();
}

function extractFilenameFromPath(string) {

    var match = string.match(filenameFromPathPattern);
    if (match && match.length > 2)
        return match[3];
    else
        return string;

}

// Utility function that prints the final report by using the input logger
function printFinalReport(logger) {

    //if (config.writers.includes('orionWriter')){
    //    while ((process.env.orionWrittenCount + process.env.orionSkippedCount) < process.env.validCount) {
    //        sleep(1000);
    //    }
    //}
   
    logger.info('\n--------  MAPPING REPORT ----------\n' +
        '\t Processed objects: ' + process.env.rowNumber + '\n' +
        '\t Mapped and Validated Objects: ' + process.env.validCount + '/' + process.env.rowNumber + '\n' +
        '\t Mapped and NOT Validated Objects: ' + process.env.unvalidCount + '/' + process.env.rowNumber + '\n' +
        '-----------------------------------------');

}


module.exports = {
    sleep: sleep,
    cleanString: cleanString,
    cleanPair: cleanPair,
    cleanRow: cleanRow,
    uuid: uuid,
    createSynchId: createSynchId,
    extensionPattern: extensionPattern,
    httpPattern: httpPattern,
    parseFunction: parseFunction,
    printFinalReport: printFinalReport,
    extractFilenameFromPath: extractFilenameFromPath
}