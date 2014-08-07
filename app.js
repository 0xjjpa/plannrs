var restify = require('restify');
var request = require('request');

function proxy(req, res, next) {
  if(req.params.url) {
    request('http://foaas.herokuapp.com/off/John/Jesus', function(error, response, body){
      res.send(response.body);
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