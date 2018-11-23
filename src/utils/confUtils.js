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

const nconf = require('nconf');
const config = require('../../config');
const log = require('./logger').app;
const path = require('path');
const pathPattern = /^.+(\/|\\)[^\/|\\]+$/g;
const utils = require('./utils');
nconf.use('memory');

process.argv.forEach(function (val, index, array) {
    nconf.argv({
        'mapPath': {
            alias: 'm',
            describe: 'File path of the mapping Json',
            type: 'string',
            demand: false
        },
        'sourceDataPath': {
            alias: 's',
            describe: 'File path of source data, following file types are supported:\n' +
                'CSV: The first row defines columns, each next one represents one data row\n' +
                'GeoJson: It must be a Feature Collection, where each Feature represents a data row' +
                'Json: a generic regular json array',
            type: 'string',
            demand: false
        },
        'targetDataModel': {
            alias: 'd',
            describe: 'The name of target Data Model in which source data will be mapped',
            type: 'string',
            demand: false
        },
        'site': {
            alias: 'si',
            describe: 'Site part of SynchroniCity Entity Id pattern. It can represent a RZ, City or area that includes several different IoT deployments, services or apps (e.g., Porto, Milano, Santander, Aarhus, Andorra, etc)',
            type: 'string',
            demand: false
        },
        'service': {
            alias: 'se',
            describe: 'Service part of SynchroniCity Entity Id pattern. It can represent a represents a smart city service/application domain for example parking, garbage, environmental etc',
            type: 'string',
            demand: false
        },
        'group': {
            alias: 'gr',
            describe: 'Group part of SynchroniCity Entity Id pattern. IT can be used for grouping assets under the same service and/or provider (so it can be used to identify different IoT providers). It is responsibility of OS sites to maintain proper group keys',
            type: 'string',
            demand: false
        },
        'rowStart': {
            alias: 'rs',
            describe: 'Row of the input file from which the mapper will start to map objects (Allowed values are integers >= 0)',
            type: 'string',
            demand: false
        },
        'rowEnd': {
            alias: 're',
            describe: ' Last Row of the input file that will be mapped (Allowed values are integers >0 or Infinity (it indicates until the end of file)',
            type: 'string',
            demand: false
        },
        'orionUrl': {
            alias: 'u',
            describe: 'URL of the context broker where mapped entities will be written',
            type: 'string',
            demand: false
        },
        'f': {
            alias: 'outputFile',
            describe: 'Output file to printout mapped entities. If not specified, it will be printed over the standard output',
            type: 'string',
            demand: false
        },
        'mo': {
            alias: 'mapOutput',
            describe: 'Output file to printout validation results. If not specified, it will be printed over the standard output',
            type: 'string',
            demand: false
        },
        'oo': {
            alias: 'orionOutput',
            describe: 'Output file to printout Orion writing results. If not specified, it will be printed over the standard output',
            type: 'string',
            demand: false
        },
        'oauthToken': {
            alias: 'oauthToken',
            describe: 'OAuth token. It adds an authorizatin headers with the format "Authorization : Bearer <TOKEN>"',
            type: 'string'
        },
        'pauthToken': {
            alias: 'pauthToken',
            describe: 'PEP-Proxy Wilma token. It adds an authorizatin headers with the format "x-auth-token : <TOKEN>"',
            type: 'string'
        },
        'h': {
            alias: 'help',
            describe: 'Print the help message',
            demand: false
        }
    }).add('file', { type: 'literal', store: config });
});

const help = () => {
    if (nconf.get('h')) {
        nconf.stores.argv.showHelp();
        process.exit(0);
    }
};

const checkConf = () => {


    var mapPath = nconf.get('mapPath');
    if (!mapPath) {
        log.error('You need to specify the mapping file path');
        return false;
    }
    if (mapPath && !mapPath.match(pathPattern)) {
        log.error('Incorrect mapping file path');
        return false;
    }

    var sourcePath = nconf.get('sourceDataPath');
    if (!sourcePath) {
        log.error('You need to specify the source file path');
        return false;
    }
    if (sourcePath && !sourcePath.match(pathPattern)) {
        log.error('Incorrect source file path');
        return false;
    }

    var dataModel = nconf.get('targetDataModel');
    if (!utils.checkInputDataModel(config.modelSchemaFolder, dataModel)) {
        log.error('Incorrect target Data Model name');
        return false;
    } else
        nconf.set('targetDataModel', path.join(config.modelSchemaFolder, dataModel + '.json'));



    if (!nconf.get('orionUrl') && !config.orionWriter.orionUrl) {
        log.error('You need to specify the remote URL of Orion Context Broker');
        return false;
    } else {
        nconf.set('orionUrl', nconf.get('orionUrl') || config.orionWriter.orionUrl);
    }

    return true;
};

const init = () => {
    help();
    return checkConf();

};

const getParam = (par) => {
    return nconf.get(par);
};



module.exports = {
    help: help,
    init: init,
    getParam: getParam
};