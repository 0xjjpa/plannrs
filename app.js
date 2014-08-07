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

var server = restify.createServer();

server.pre(restify.CORS({credentials: true}));
server.pre(restify.fullResponse());
server.use(restify.queryParser());
server.get('/api/proxy', proxy);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});