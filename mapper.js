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

const config = require('./config');

process.env.NODE_ENV = config.env; // 'debug' or 'production' for the logger
process.env.LOG = config.logLevel;
process.env.MODE = config.mode; // 'commandLine' or 'server'
process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';

if (config.mode === 'commandLine') {
    const cli = require('./src/cli/setup');
    return cli();
} else if (config.mode === 'server') {
    const s = require('./src/server/setup');
    return s();
}


module.exports = function (sourceDataIn, mapPathIn, dataModelIn) {
    var module = {};
    if (config.mode === 'commandLine') {
        const cli = require('./src/cli/setup');
        return cli(sourceDataIn, mapPathIn, dataModelIn);
    } else if (config.mode === 'server') {
        const s = require('./src/server/setup');
        return s();
    }
};