var express = require('express');
var router = express.Router();
var speech_to_text = require('./features/speech_to_text');
var classifier = require('./features/classifier');

module.exports = router;
// speech-to-text
router.get('/api/speech-to-text/token*',speech_to_text.stt_token);
router.get('/api/text-to-speech/synthesize*',speech_to_text.tts_synthesize);

// classify using NLC
router.post('/api/understand/classifyInd*', classifier.classifyInd);
