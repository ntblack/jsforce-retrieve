const path = require('path');
const jsforce = require('jsforce');
const {retrieveByPackageXML} = require('jsforce-metadata-tools');
const CONNECTION_NAME = 'JSFORCE_RETRIEVE';
const fs = require('fs');

const retrieve = function(conn, options) {

    console.log(`jsforce connected to ${conn.instanceUrl}`);
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

    return retrieveByPackageXML(packageXml, {connection: CONNECTION_NAME})
        .then((data) => {
            console.log("got some data");
            const zipOut = fs.createWriteStream(zipOutputPath);
            zipOut.on('close', () => console.log(`${zipOut.bytesWritten} bytes written`));
            zipOut.on('error', (err) => console.error(err));
            zipOut.write(data.zipFile, 'base64', () => console.log("data written"));
            zipOut.end();
        }).catch((err) => {
            console.error(err);
        });
};

module.exports = retrieve;