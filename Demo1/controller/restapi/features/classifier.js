var extend = require('extend');
var cfenv = require('cfenv');
var watson = require('watson-developer-cloud');
var WATSON_NLC_SERVICE_NAME = "Watson-NLC-Service";
var config = require("../../env.json");

var appEnv = cfenv.getAppEnv();

var serviceCreds = appEnv.getServiceCreds(WATSON_NLC_SERVICE_NAME) || process.env.NLC_CREDS || config.watson_nlc;
var natural_language_classifier = watson.natural_language_classifier(serviceCreds);
var classifier_id_industry = process.env.NLC_CLASSIFIER_ID || "your classifier id goes here";
exports.classifyInd = function(req, res) {
  console.log("Classifier entered");
    _text = req.body.cquery;
    i_output = {};
    (function(_res) {
        natural_language_classifier.classify({
                text: _text,
                classifier_id: classifier_id_industry
            },
            function(err, response) {
                _res.writeHead(200, { "Content-Type": "text/plain" });
                _res.end(nlc_res("Industry", err, response));
            });
    })(res)
}

function nlc_res(classifier, err, response) {
    var _output = [];
    if (err) {
        console.log(classifier + ' error:', err);
        _output = { 'error': JSON.stringify(err, null, 2) };
    } else {
        _output = { results: JSON.stringify(response, null, 2) };
    }
    console.log("Printing from nlc_res");
    console.log(_output);
    return (JSON.stringify(_output, null, 2));
}
