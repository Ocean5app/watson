// z2c-conversation.js
// browser support for conversation
// display interaction same as in Chapter 6 - custom dialog

// talk to me ... use the existing text to speech service to talk to the user
var _input;
var _conversation;
var _context = {};

// initialize the page
function initiateConversation()
{
  _input = $("#textInput");
  _conversation = $("#conversation");
  _conversation.empty()
  getResponse("Hi There!");
}
function getMessage()
 {
   _conversation.append('<div class="shape bubble1"><p>'+_input.val()+"</p></div>");
   getResponse(_input.val());
   _input[0].value = "";
}

function getResponse(_text)
{
   var options = {};
   options.input = _text;
   options.context = _context;
   $.when($.post("/api/response", options)).then(
     function(res, _type, _jqXHR)
     {console.log("z2c-conversations.js getMessage Success res"+res);
       _conversation.append('<div class="shape bubble2"><p>'+res.output.text+"</p></div>");
     },
   function(res, _type, _jqXHR)
     { console.log("z2c-conversations.js getMessage Failure res.responseText"+res.responseText);
      _conversation.append('<div class="shape bubble2"><p>'+res.responseText+"</p></div>");
     });
 }
