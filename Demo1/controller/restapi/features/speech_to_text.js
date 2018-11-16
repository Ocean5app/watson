 // get required modules for speech to text
 var extend = require('extend');
 var watson = require('watson-developer-cloud');
 var vcapServices = require('vcap_services');
 
 // load in the environment data for our application
 var config = require('../../env.json');
 
 /**
  * this returns a speech to text token to be used in the browser for direct access
  * to the Watson speech to text service. 
  * @param {NodeJS Request Object} req - provides information about the inbound request
  * @param {NodeJS Response Object} res - this is how we respond back to the browser
  */
 exports.stt_token = function(req, res) {
     // the extend function adds additional information into our credentials from within the 
     // Watson and Bluemix operating environment
     var sttConfig = extend(config.speech_to_text, vcapServices.getCredentials('speech_to_text'));
     console.log(config.speech_to_text);
     console.log(vcapServices.getCredentials('speech_to_text'));
     console.log(sttConfig);
     // request authorization to access the service
     var sttAuthService = watson.authorization(sttConfig);
 
     // now that we're authenticated, get the token
     sttAuthService.getToken({
         url: sttConfig.url
     }, function(err, token) {
         if (err) {
             // send an error back if we cannot retrieve the token successfully
             console.log('Error retrieving token: ', err);
             res.status(500).send('Error retrieving token'+ReferenceError);
             return;
         }
         // if we're successful, then send the new token back to the browser
         res.send(token);
     });
 }

/**
 * this returns a speech to text token to be used in the browser for direct access
 * to the Watson speech to text service. 
 * @param {NodeJS Request Object} req - provides information about the inbound request
 * This is accessed via a post request rather than a get request. A post request normally
 * has options (data) associated with it and these come in to nodejs as part of the 
 * req.body object.
 * @param {NodeJS Response Object} res - this is how we respond back to the browser
 */

exports.tts_synthesize = function(req, res) {
    console.log("tts_synthesize entered");
    // use the environment variables to configure text to speech
      var ttsConfig = watson.text_to_speech(config.text_to_speech);
      // give the synthesizer the data from the browser.
      // you may find that you get errors if you send in an empty text string. 
      // this can be avoided by testing req.query to see if it has any text in it
      // that would be a good exercise to extend this code
      var transcript = ttsConfig.synthesize(req.query);
      transcript.on('response', function(response) {
        if (req.query.download) {
          response.headers['content-disposition'] = 'attachment; filename=transcript.ogg';
        }
      });
      // if there's an error, log it to the server console window.
      transcript.on('error', function(error) { console.log("error encountered: "+error); next(error); });
      // pipe sends the sound as a stream (vs a downloaded file) back to the browser
      transcript.pipe(res);
  }