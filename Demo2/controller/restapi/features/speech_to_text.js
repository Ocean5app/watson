'use strict';

const AuthorizationV1 = require('watson-developer-cloud/authorization/v1');
const SpeechToTextV1  = require('watson-developer-cloud/speech-to-text/v1');
const TextToSpeechV1  = require('watson-developer-cloud/text-to-speech/v1');
const vcapServices = require('vcap_services');

const getFileExtension = (acceptQuery) => {
    const accept = acceptQuery || '';
    switch (accept) {
      case 'audio/ogg;codecs=opus':
      case 'audio/ogg;codecs=vorbis':
        return 'ogg';
      case 'audio/wav':
        return 'wav';
      case 'audio/mpeg':
        return 'mpeg';
      case 'audio/webm':
        return 'webm';
      case 'audio/flac':
        return 'flac';
      default:
        return 'mp3';
    }
  };

// speech to text token endpoint
var sttAuthService = new AuthorizationV1(
    Object.assign(
        {
            username: process.env.SPEECH_TO_TEXT_USERNAME, 
            password: process.env.SPEECH_TO_TEXT_PASSWORD
        },
        vcapServices.getCredentials('speech_to_text') // pulls credentials from environment in bluemix, otherwise returns {}
    )
);
exports.stt_token = function (req, res) {
    sttAuthService.getToken(
        {
            url: SpeechToTextV1.URL || process.env.SPEECH_TO_TEXT_URL
        },
        function (err, token) {
            if (err) {
                console.log('Error retrieving token: ', err);
                res.status(500).send('Error retrieving token');
                return;
            }
            res.send(token);
        }
    );
};
// text to speech token endpoint
var ttsAuthService = new AuthorizationV1(
    Object.assign(
        {
            username: process.env.TEXT_TO_SPEECH_USERNAME, // or hard-code credentials here
            password: process.env.TEXT_TO_SPEECH_PASSWORD
        },
        vcapServices.getCredentials('text_to_speech') // pulls credentials from environment in bluemix, otherwise returns {}
    )
);
exports.tts_token = function (req, res) {
    ttsAuthService.getToken(
        {
            url: TextToSpeechV1.URL || process.env.TEXT_TO_SPEECH_URL
        },
        function (err, token) {
            if (err) {
                console.log('Error retrieving token: ', err);
                res.status(500).send('Error retrieving token');
                return;
            }
            res.send(token);
        }
    );
};

let textToSpeech;
if (process.env.TEXT_TO_SPEECH_IAM_APIKEY && process.env.TEXT_TO_SPEECH_IAM_APIKEY !== '') {
    textToSpeech = new TextToSpeechV1({
    url: process.env.TEXT_TO_SPEECH_URL || 'https://stream.watsonplatform.net/text-to-speech/api',
    iam_apikey: process.env.TEXT_TO_SPEECH_IAM_APIKEY || '<iam_apikey>',
    iam_url: 'https://iam.bluemix.net/identity/token',
  });
} else {
    textToSpeech = new TextToSpeechV1({
    url: process.env.TEXT_TO_SPEECH_URL || 'https://stream.watsonplatform.net/text-to-speech/api',
    username: process.env.TEXT_TO_SPEECH_USERNAME || '<username>',
    password: process.env.TEXT_TO_SPEECH_PASSWORD || '<password>',
  });
}
exports.tts_synthesize = function(req, res, next) {
    const transcript = textToSpeech.synthesize(req.query);
    transcript.on('response', (response) => {
      if (req.query.download) {
        response.headers['content-disposition'] = `attachment; filename=transcript.${getFileExtension(req.query.accept)}`;
      }
    });
    transcript.on('error', next);
    transcript.pipe(res);
}
