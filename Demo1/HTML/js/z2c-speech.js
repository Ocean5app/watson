/*
** z2c-speech.js
*/
var a_player_target = "#a_player";
var NLC_Button ; var stt_out; var msg_out;
var _mic; var _stop; var toLoad ="";

function initPage ()
{ document.cookie = "stt-token=";
  //loadPage('discovery'); //??
  var b_authenticated = checkAuthenticated();
  if (b_authenticated == false)
  { toLoad = "login_1.html"; } else {toLoad = "body.html";}
  $.when($.get(toLoad)).done(function (page)
    {$("#body").empty(); $("#body").append(page);
    if (b_authenticated == true)
    {  initiateDialog(); }
    else {  authenticate(); }});
}

function initiateDialog ()
{
  _mic = $('#microphone'); _stop = $("#stop");
  var readText = $("#readText"); NLC_Button = $("#classifySpeech");
  var stt_target = '#speech'; stt_out = $(stt_target);
  var chat = $('#chat'); var dialog_target = '#conversation';
  var stream;
  toggle_mic(_mic, _stop, false)

  _mic.on("click", function ()
    {
      var _className = this.className;
      if(this.className == "mic_enabled")
      {toggle_mic(_mic, _stop, true); nextStep(); }
      });

  _stop.on("click",  function()
  {
    if(this.className == "mic_enabled")
    { toggle_mic(_mic, _stop, false); nextStep(); }
  });

  NLC_Button.on("click",  function()
    { nextStep(); });

  startDialog(dialog_target);
}

// enable/disable mic
function toggle_mic(_microphone, _stopbutton, b_on)
{
  if(b_on) // microphone button clicked, enable stop button
  {
    _microphone.addClass("mic_disabled");
    _microphone.removeClass("mic_enabled");
    _stopbutton.addClass("mic_enabled");
    _stopbutton.removeClass("mic_disabled");
  } else // stop button clicked, enable microphone button
  {
    if (!((typeof(stream) == "undefined") || (stream == null))) {stream.stop(); }
    _microphone.addClass("mic_enabled");
    _microphone.removeClass("mic_disabled");
    _stopbutton.addClass("mic_disabled");
    _stopbutton.removeClass("mic_enabled");
  }
}
// create a function to handle speech to text in general
// pass in the name of the HTML object which will display the received text.
function listen(_target)
{
  if (getCookieValue("stt-token")=="")
  {
  $.when($.get('/api/speech-to-text/token')).done(
    function (token) {
      console.log("received STT token is: "+token);
      document.cookie = "stt-token="+token;
      listen_2(_target, token);
      });
  }else
    { listen_2(_target, getCookieValue("stt-token")); }
}
function listen_2 (_target, token)
{
  console.log("listen_2 token is: "+token);
  stream = WatsonSpeech.SpeechToText.recognizeMicrophone({
     token: token,
     outputElement: _target // CSS selector or DOM Element
   });
  stream.on('error', function(err) { console.log(err); });
}
// create a function to handle text to speech in general
// pass in the text string to be read, the audio player to use and if the audio player should be displayed.
function speak (_chat, _a_player_target, b_display)
{
  var textString = _chat;
  var voice = 'en-US_AllisonVoice';
  var audioFrame = $(_a_player_target);
  var audio = audioFrame.get(0);
  var synthesizeURL = '/api/text-to-speech/synthesize' +
    '?voice=' + voice +
    '&text=' + encodeURIComponent(textString) +
    '&X-WDC-PL-OPT-OUT=' ;
  audio.src = synthesizeURL
  audio.pause();
  audio.addEventListener('canplaythrough', onCanplaythrough);
  audio.muted = true;
  audio.play();
  (b_display) ? audioFrame.show() : audioFrame.hide();
}

function onCanplaythrough() {
  var audio = $(a_player_target).get(0);
  audio.removeEventListener('canplaythrough', onCanplaythrough);
  try { audio.currentTime = 0; }
  catch(ex) { // ignore. Firefox just freaks out here for no apparent reason.
            }
  audio.controls = true;
  audio.muted = false;
  $('html, body').animate({scrollTop: $('#a_player').offset().top}, 500);
  $('body').css('cursor', 'default');
}
