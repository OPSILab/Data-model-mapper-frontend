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

const commandLine = require('../utils/confUtils');
const process = require('../utils/process');
const config = require('../../config');

const log = require('../utils/logger').app;
const utils = require('../utils/utils');

//const fs = require('fs');


//const outFn = (v) => {
//	if (clOutput) {
//		fs.writeFile(clOutput, JSON.stringify(v, null, 4), () => {});
//	} else {
//		log.info(JSON.stringify(v, null, 4));
//	}
//};

module.exports = (sourceDataIn, mapPathIn, dataModelIn) => {
    log.info("Initializing Mapper in Command Line Mode");

    if (commandLine.init()) {

        // file path or directly string/binary content 
        var sourceData = sourceDataIn || commandLine.getParam('sourceDataPath');
        var mapPath = mapPathIn || commandLine.getParam('mapPath');
        var dataModelPath = undefined;

        if ((dataModelPath = utils.getDataModelPath(dataModelIn)) !== undefined)
            ;
        else {
            dataModelPath = commandLine.getParam('targetDataModel');
        }

        const oauthToken = commandLine.getParam('oauthToken');
        const pauthToken = commandLine.getParam('pauthToken');
        if (oauthToken) {
            process.env.OAUTH_TOKEN = oauthToken;
        }
        if (pauthToken) {
            process.env.PAUTH_TOKEN = pauthToken;
        }

        process.processSource(sourceData, "", mapPath, dataModelPath);

    }
};

