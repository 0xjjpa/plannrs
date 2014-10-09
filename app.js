var restify = require('restify');
var request = require('request');
var credentials = require('./config.json');

function proxy(req, res, next) {
  console.log("Proxy was called");
  if(req.params.url) {
    request({url:req.params.url, json: true, auth: credentials}, function(error, response, body){
      res.send(body);
    });
  } else {
    res.send({});
  }
  next();
}

function createIssue(req, res, next) {
  console.log("Post Proxy was called");
  if(req.params) {
    request.post({
     url:"https://jira.cwc.io/rest/api/latest/issue",
     json: true, 
     auth: credentials, 
     body:req.params
   }, function(error, response, body){
      console.log("Error", error);
      console.log("Response", response);
      console.log("Body", body);
      res.send({});
    });
  } else {
    res.send({});
  }
  res.send(201, {})
  next();
}

var server = restify.createServer();

server.pre(restify.CORS({credentials: true}));
server.pre(restify.fullResponse());
server.use(restify.bodyParser());
server.use(restify.queryParser());
server.get('/api/proxy', proxy);
server.post('/api/createIssue', createIssue);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});