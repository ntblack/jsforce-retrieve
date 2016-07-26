const path = require('path');
const jsforce = require('jsforce');
const {retrieveByPackageXML} = require('jsforce-metadata-tools');
const CONNECTION_NAME = 'JSFORCE_RETRIEVE';
const fs = require('fs');

const retrieve = function(conn, options) {

    const logger = options.logger || {log: console.log, error: console.error};


    // jsforce-metadata-tools cannot be configured with a pre-initialized connection, but it can be configured with a
    // connection name which it retrieves from the jsforce registry. because we are configuring our own connection,
    // override the jsforce registry so that our connection will be used.
    const registry = jsforce.registry;
    jsforce.registry = {
        getConnection: function (name) {
            if(name === CONNECTION_NAME) {
                return conn;
            } else {
                return registry.getConnection(name);
            }
        }
    };

    const packageXml = options.packageXml || path.join('salesforce', 'src', 'package.xml');
    const zipOutputPath = options.outputPath || path.join('.', 'package.zip');

    logger.log(`retrieving ${packageXml} from ${conn.instanceUrl}`);
    return retrieveByPackageXML(packageXml, {connection: CONNECTION_NAME})
        .then((data) => {
            if(!data.success) {
                logger.error(`Failed to retrieve metadata: ${JSON.stringify(data.errors)}`);
            }
            const zipOut = fs.createWriteStream(zipOutputPath);
            zipOut.on('close', () => logger.log(`${zipOut.bytesWritten} bytes written to ${zipOutputPath}`));
            zipOut.on('error', (err) => logger.error(err));
            zipOut.write(data.zipFile, 'base64');
            zipOut.end();
        }).catch((err) => {
            console.error(err);
        });
};

module.exports = retrieve;