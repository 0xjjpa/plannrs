var restify = require('restify');
var request = require('request');
var credentials = require('./config.json');

var JIRA_URL = 'https://jira.cwc.io/rest/api/latest'

function proxyForGET(req, res, next) {
  console.log("GET proxy called");
  if(req.params && req.params.url) {
    request({url:JIRA_URL+req.params.url, json: true, auth: credentials}, function(error, response, body){
      res.send(body);
    });
  } else {
    res.send({});
  }
  next();
}

function proxyForPOST(req, res, next) {
  console.log("POST proxy called");
  if(req.params && req.params.url) {
    request({url:JIRA_URL+req.params.url, json: true, auth: credentials, body: req.params.body}, function(error, response, body){
      res.send(201, body)
    });
  } else {
    res.send(400);
  }
  next();
}

var server = restify.createServer();

server.pre(restify.CORS({credentials: true}));
server.pre(restify.fullResponse());
server.use(restify.bodyParser());
server.use(restify.queryParser());
server.get('/api/proxy', proxyForGET);
server.post('/api/proxy', proxyForPOST);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});