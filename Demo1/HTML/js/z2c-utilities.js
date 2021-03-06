// utility functions

function getCookieValue(_name)
{
  var name = _name+"=";
  var cookie_array= document.cookie.split(";");
  for (each in cookie_array)
    { var c = cookie_array[each].trim();
      if(c.indexOf(name) == 0) return(c.substring(name.length, c.length));
    }
    return("");
}

// Inspired by http://bit.ly/juSAWl
// Augment String.prototype to allow for easier formatting.  This implementation
// doesn't completely destroy any existing String.prototype.format functions,
// and will stringify objects/arrays.
String.prototype.format = function(i, safe, arg) {

  function format() {
    var str = this, len = arguments.length+1;

    // For each {0} {1} {n...} replace with the argument in that position.  If
    // the argument is an object or an array it will be stringified to JSON.
    for (i=0; i < len; arg = arguments[i++]) {
      safe = typeof arg === 'object' ? JSON.stringify(arg) : arg;
      str = str.replace(RegExp('\\{'+(i-1)+'\\}', 'g'), safe);
    }
    return str;
  }

  // Save a reference of what may already exist under the property native.
  // Allows for doing something like: if("".format.native) { /* use native */ }
  format.native = String.prototype.format;

  // Replace the prototype property
  return format;

}();

// strip final period if exists
function trimStrip(_string)
{
  var str = _string.trim();
  var len = str.length;
  if(str.endsWith(".")) {str=str.substring(0,len-1);}
  if(str.endsWith(",")) {str=str.substring(0,len-1);}
  return(str);
}
function displayObjectProperties(_obj)
{
  for(var propt in _obj){ console.log("object property: "+propt ); }
}

function displayObjectValues (_string, _object)
{
  for (prop in _object){
      console.log(_string+prop+": "+(((typeof(_object[prop]) == 'object') || (typeof(_object[prop]) == 'function'))  ? typeof(_object[prop]) : _object[prop]));
    }
}

function accToggle(_parent, _body)
{
	var parent = "#"+_parent;
	var body="#"+_body+"_content";
	var header = "#"+_body+"_header";
  console.log("accToggle: body: "+body+" header: "+header);
	if ($(body).hasClass("on"))
		{$(body).removeClass("on"); $(body).addClass("off");
		$(header).removeClass("on"); $(header).addClass("off");
		}else
		{
		accOff(parent);
		$(body).removeClass("off"); $(body).addClass("on");
		$(header).removeClass("off"); $(header).addClass("on");
		}
}
function accOff(target)
{
	var thisElement = $(target);
	var childNodes = thisElement.children();
	for (each in childNodes)
		{var node = "#"+childNodes[each].id;
			if($(node).hasClass("on")) {$(node).removeClass("on");}
			$(node).addClass("off");
		}
}

function checkImageDroppable()
{
  var div = document.createElement('div');
  return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}

function detectKey(event, cbfn)
{
  var code = (event.keyCode ? event.keyCode : event.which);
  if(code == 13)
  {
    switch(cbfn){
      case "login" :
      login();
      break;
      case "getMessage" :
      getMessage();
      case "doQuery" :
      doQuery();
      break;
    }
  }
}

// The loaderTarget object is designed to be used with the loadPage function.
// The object has 3 parts: name (e.g. 'converstion') and a secondaary object
// the name is used in the index.html file (or any other desired location) as the parameter passed to the loadPage function
// The secondary object has two parts:
//   html - this is the html page to be loaded.
//   cbfn - this is the CallBackFunction to be called to initialize the page once loaded.
var loaderTarget = {
  discovery: {html: "discovery.html", cbfn: initiateDiscovery},
  discovery_admin: {html: "discovery_admin.html", cbfn: initiateDiscovery_admin}
}

// the loadPage routine would benefit from an update.
// in this implementation, it assumes (really bad idea) that the page-to-be-loaded will always be placed in the HTML "body" object.
// it would be much better if the loadPage function took a second paraemter which specified where to append the new page fragment.
function loadPage(_target)
{
  $.when($.get(loaderTarget[_target].html)).done(function(page)
  {$("#body").empty(); $("#body").append(page); loaderTarget[_target].cbfn();})
}

/**
 * getIt issues a get request to the target URL, issued by the _source method, and issues a callback to _display on successful completion
 * @param {String} _target - URL to invoke
 * @param {String} _source - invoking method
 * @param {String} _display - callback method
 * @param {String} d_target - error message target
 * 
 */
function getIt(_target, _source, _display, d_target)
{
  $.when(
    $.get(_target)).done(
      function(_res){
        d_target.empty(); let _str = ''; 
        if (_res.result === 'success')
        { _str = _display(_res);}
        else
        { _str = '<h3>'+_source+' failed with error:</h3><br/>'+JSON.stringify(_res.message); }
        d_target.append(_str);
      });

}

/**
 * potIt issues a post request to the target URL, issued by the _source method, and issues a callback to _display on successful completion
 * @param {String} _target - URL to invoke
 * @param {String} _source - invoking method
 * @param {String} _display - callback method
 * @param {String} d_target - error message target
 * @param {String} _options - post options
 * 
 */
function postIt(_target, _source, _display, d_target, _options)
{
  $.when(
    $.post(_target, _options)).done(
      function(_res){
        d_target.empty(); let _str = ''; 
        if (_res.result === 'success')
        { _str = _display(_res, d_target);}
        else
        { _str = '<h3>'+_source+' failed with error:</h3><br/>'+JSON.stringify(_res.message); }
        d_target.append(_str);
      });

}
