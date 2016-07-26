#! /usr/bin/env node

const createConnection = require('jsforce-connection').default;
const retrieve = require('../index.js');

createConnection()
    .then((conn) => retrieve(conn, {packageXml:'test/retrieve/package.xml'}))
    .catch((err) => console.error(err));


