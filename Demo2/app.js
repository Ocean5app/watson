const express = require('express');
var bodyParser = require('body-parser');

const app = express();

app.use(express.static('./public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({limit: '50mb'}));
app.set('appName', 'Watson Demo2');
app.use('/', require("./controller/restapi/router"));

module.exports = app;
