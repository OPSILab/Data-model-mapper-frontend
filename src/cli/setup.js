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

const commandLine = require('../utils/confUtils');
const process = require('../utils/process');
const config = require('../../config')

const log = require('../utils/logger').app(module);
const utils = require('../utils/utils');

let service = require ("../server/api/services/service")

module.exports = async (sourceDataIn, mapPathIn, dataModelIn) => {
    log.info("Initializing Mapper in " + (config.mode == "commandLine" ? "Command Line " : "Server ") + "Mode");

    if (commandLine.init(sourceDataIn, mapPathIn, dataModelIn)) {

        log.debug("commandLine.init()");

        // file path or directly string/binary content 
        var sourceData = sourceDataIn || commandLine.getParam('sourceDataPath');
        var mapPath = mapPathIn || commandLine.getParam('mapPath');
        var dataModelPath = utils.getDataModelPath(dataModelIn) || commandLine.getParam('targetDataModel');

        try {
            await process.processSource(sourceData, "", mapPath, dataModelPath);
        } catch (error) {
            log.error(error)
            return error
        }

        log.debug("process.processSource end")

    } else {
        log.error("There was an error while initializing Mapper configuration");
        service.error = "There was an error while initializing Mapper configuration"
    }
};

