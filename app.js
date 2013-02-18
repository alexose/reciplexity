
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// Connect to the db
var mongo = require('mongodb');

mongo.connect("mongodb://localhost:27017/allrecipes", function(err, db) {
  if(!err) {
    console.log("We are connected");
  }
  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });
  app.set('db', db);
  app.get('/', routes.index);
  app.post('/crawl', require('./routes/crawl').crawl);
  app.post('/parse', require('./routes/parse').parse);
  app.post('/generate', require('./routes/generate').generate);
  app.post('/list', require('./routes/generate').list);
});
