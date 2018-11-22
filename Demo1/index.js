 /*
 * Watson Demo #1 : Web App
 * WuYang
 * 
 */
var express = require('express');// 各种模块开始导入
var http = require('http');
var https = require('https');
var path = require('path');
var fs = require('fs');
var mime = require('mime');
/*
https://github.com/expressjs/body-parser
The bodyParser object exposes various factories to create middlewares. 
All middlewares will populate the req.body property with the parsed body 
when the Content-Type request header matches the type option, or an empty object ({}) 
if there was no body to parse, the Content-Type was not matched, or an error occurred.

1. bodyParser.json(options): 解析json数据
2. bodyParser.raw(options): 解析二进制格式(Buffer流数据)
3. bodyParser.text(options): 解析文本数据
4. bodyParser.urlencoded(options): 解析UTF-8的编码的数据。
*/
var bodyParser = require('body-parser'); 
var cookieParser = require('cookie-parser');
var cfenv = require('cfenv');

var session = require('express-session');
var cloudant = require('cloudant');
var myDB = require('./controller/restapi/features/cloudant_utils');
myDB.authenticate(myDB.create, '');
var sessionBase  = require('./controller/sessionManagement');
var sessionStore = Object.create(sessionBase.SessionObject);

var vcapServices = require('vcap_services');
var uuid = require('uuid');
var env = require('./controller/env.json');

var sessionSecret = env.sessionSecret;
var gmailCredentials = env.gmail;

var appEnv = cfenv.getAppEnv(); //取得云环境参数
var app = express(); //新建express实例

// the session secret is a text string of arbitrary length which is
//  used to encode and decode cookies sent between the browser and the server
/**
for information on how to enable https support in osx, go here:
  https://gist.github.com/nrollr/4daba07c67adcb30693e
openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
**/
if (cfenv.getAppEnv().isLocal == true)
{
  var pkey = fs.readFileSync('key.pem');
  var pcert = fs.readFileSync('cert.pem')

  var httpsOptions = { key: pkey, cert: pcert };
} else {
  app.enable('trust proxy');
  app.use (function (req, res, next) {
          if (req.secure) {next();}
          else {res.redirect('https://' + req.headers.host + req.url);}
  });
}
app.use(cookieParser(sessionSecret));
app.use( session( {
    store: sessionStore,
    secret: sessionSecret, resave: false, saveUninitialized: true,
    cookie: {secure: true, maxAge:24*60*60*1000},
    genid: function (req) {return uuid.v4()}
  }));
app.get('/login*', function (req, res) {console.log("login session is: "+req.session); loadSelectedFile(req, res);});


//app.use(cookieParser()); //cookieParser中间件用于获取web浏览器发送的cookie中的内容. 不用这个下面就不能用 req.cookies 来取得客户端来的cookie值
/*body-parser: Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
*/
/*bodyParser.urlencoded([options])
Returns middleware that only parses urlencoded bodies and only looks at requests 
where the Content-Type header matches the type option. This parser accepts only UTF-8 encoding
 of the body and supports automatic inflation of gzip and deflate encodings.

A new body object containing the parsed data is populated on the request object after 
the middleware (i.e. req.body). This object will contain key-value pairs, where the 
value can be a string or array (when extended is false), or any type (when extended is true).
*/
app.use(bodyParser.urlencoded({ extended: true }));
/*bodyParser.json([options]):Returns middleware that only parses json and only looks at requests 
where the Content-Type header matches the type option. This parser accepts any Unicode encoding 
of the body and supports automatic inflation of gzip and deflate encodings.
A new body object containing the parsed data is populated on the request object after the 
middleware (i.e. req.body).*/
app.use(bodyParser.json());//作用是对post请求的请求体进行解析
app.set('appName', 'watsonDemo');
// disable the following line in Bluemix. App will start on port 6003 in Bluemix
//app.set('port', process.env.PORT || 6003);
// enable the following line in Bluemix
 app.set('port', appEnv.port);

/*应用程序视图的目录或目录数组。如果一个数组，视图会按照数组中出现的顺序查找 
eg：app.set('views', path.join(__dirname, 'views'))*/
app.set('views', path.join(__dirname + '/HTML'));
/*EJS是一个javascript模板库，用来从json数据中生成HTML字符串
功能：缓存功能，能够缓存好的HTML模板；
<% code %>用来执行javascript代码*/
app.engine('html', require('ejs').renderFile);//想用ejs模板引擎来处理“.html”后缀的文件
app.set('view engine', 'ejs');////设置视图模板的默认后缀名为.ejs  https://github.com/tj/ejs
app.use(express.static(__dirname + '/HTML'));//将包含静态资源的目录的名称传递给 express.static 中间件函数，以便开始直接提供这些文件。
app.use(bodyParser.json());//作用是对post请求的请求体进行解析 ?? 为什么用了两回 ??

// Define your own router file in controller folder, export the router, add it into the index.js.
// app.use('/', require("./controller/yourOwnRouter"));

app.use('/', require("./controller/restapi/router"));

http.createServer(app).listen(app.get('port'),
    function(req, res) {
        console.log(app.get('appName')+' is listening on port: ' + app.get('port'));
    });

function loadSelectedFile(req, res) {
    var uri = req.originalUrl;
    var filename = __dirname + "/HTML" + uri;
    fs.readFile(filename,
        function(err, data) {
            if (err) {
                res.writeHead(500);
                console.log('Error loading ' + filename + ' error: ' + err);
                return res.end('Error loading ' + filename);
            }
            res.setHeader('content-type', mime.lookup(filename));
            res.writeHead(200);
            res.end(data);
        });
}
