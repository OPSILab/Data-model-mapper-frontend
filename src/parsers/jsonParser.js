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

var JSONStream = require('JSONStream');
const request = require('request');
const fs = require('fs');
const utils = require('../utils/utils.js');
const log = require('../utils/logger').app;
const report = require('../utils/logger').report;


function sourceDataPathToRowStream(sourceData, map, schema, rowHandler, mappedHandler) {

    // The source Data is the file content itself
    if (sourceData && !sourceData.ext) {

        try {
            fileToRowStream(Buffer.from(sourceData), map, schema, rowHandler, mappedHandler);
        }
        catch (err) {
            log.error('There was an error while getting buffer from source data: ' + err);
        }

    }
    else if (utils.httpPattern.test(sourceData))
        urlToRowStream(sourceData, map, schema, rowHandler, mappedHandler);
    else
        fileToRowStream(sourceData.absolute, map, schema, rowHandler, mappedHandler);
}

function urlToRowStream(url, map, schema, rowHandler, mappedHandler) {

    var rowNumber = Number(process.env.rowNumber);
    var rowStart = Number(process.env.rowStart);
    var rowEnd = Number(process.env.rowEnd);

    request(url).pipe(JSONStream.parse('.*'))
        .on('error', function (err) {
            console.error(err);
        })
        .on('header', function (columns) {
            //  console.log('Columns: ' + columns);
        })
        .on('data', function (data) {

            rowNumber = Number(process.env.rowNumber) + 1;
            process.env.rowNumber = rowNumber;
            // outputs an object containing a set of key/value pair representing a line found in the csv file.
            if (rowNumber >= rowStart && rowNumber <= rowEnd) {

                rowHandler(rowNumber, row, map, schema, mappedHandler);

            }
        })
        .on('column', function (key, value) {
            // outputs the column name associated with the value found
            // console.log('#' + key + ' = ' + value);
        })
        .on('end', function () {

            utils.printFinalReport(log);
            utils.printFinalReport(report);
            //if (process.env.hasFileWriter == 'true')
            //    fileWriter.finalize();

        });
}


function fileToRowStream(filename, map, schema, rowHandler, mappedHandler) {

    var rowNumber = Number(process.env.rowNumber);
    var rowStart = Number(process.env.rowStart);
    var rowEnd = Number(process.env.rowEnd);

    fs.createReadStream(filename).pipe(JSONStream.parse('.*'))
        .on('error', function (err) {
            console.error(err);
        })
        .on('header', function (columns) {
            // console.log(columns);
        })
        .on('data', function (row) {

            rowNumber = Number(process.env.rowNumber) + 1;
            process.env.rowNumber = rowNumber;
            // outputs an object containing a set of key/value pair representing a line found in the csv file.
            if (rowNumber >= rowStart && rowNumber <= rowEnd) {

                rowHandler(rowNumber, row, map, schema, mappedHandler);

            }

        }).on('column', function (key, value) {
            // outputs the column name associated with the value found
            //console.log('#' + key + ' = ' + value);
        })
        .on('end', function () {

            utils.printFinalReport(log);
            utils.printFinalReport(report);
            //if (process.env.hasFileWriter == 'true')
            //    fileWriter.finalize();

        });

}

module.exports = {
    sourceDataPathToRowStream: sourceDataPathToRowStream
};