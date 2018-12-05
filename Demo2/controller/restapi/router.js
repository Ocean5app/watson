var express = require('express');
var router = express.Router();
var speech_to_text = require('./features/speech_to_text');
var assistant = require('./features/assistant');
var format = require('date-format');

var count = 0;
router.use(function(req, res, next) {
  count++;
  console.log('['+count+'] at: '+format.asString('hh:mm:ss.SSS', new Date())+' Url is: ' + req.url);
  next(); 
});

module.exports = router;
router.get('/api/speech-to-text/token*',speech_to_text.stt_token);
router.get('/api/text-to-speech/synthesize*',speech_to_text.tts_synthesize);
router.post( '/api/response', assistant.response);
