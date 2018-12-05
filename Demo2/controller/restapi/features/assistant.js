'use strict';

var AssistantV1 = require('watson-developer-cloud/assistant/v1'); 
var assistant = new AssistantV1({
    version: '2018-07-10'
  });

exports.message = function(req, res) {
    var workspace = process.env.WORKSPACE_ID || '<workspace-id>'; 
    if (!workspace || workspace === '<workspace-id>') {
      return res.json({
        'output': {
          'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
        }
      });
    }
    var payload = {
      workspace_id: workspace,
      context: req.body.context || {},
      input: req.body.input || {}
    };
      // Send the input to the assistant service
      assistant.message(payload, function (err, data) { 
      if (err) {
        return res.status(err.code || 500).json(err);
      }
      //return res.json(data);
      return res.json(updateMessage(payload, data));
    });
  };
  
  /**
   * Updates the response text using the intent confidence
   * @param  {Object} input The request to the Assistant service
   * @param  {Object} response The response from the Assistant service
   * @return {Object}          The response with the updated message
   */
  function updateMessage(input, response) {
    var responseText = null;
    if (!response.output) {
      response.output = {};
    } else {
      return response;
    }
    if (response.intents && response.intents[0]) {
      var intent = response.intents[0];
      if (intent.confidence >= 0.75) {
        responseText = 'I understood your intent was ' + intent.intent;
      } else if (intent.confidence >= 0.5) {
        responseText = 'I think your intent was ' + intent.intent;
      } else {
        responseText = 'I did not understand your intent';
      }
    }
    response.output.text = responseText;
    return response;
  }