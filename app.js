
/**
 * Module dependencies.
 */

var express = require('express')
  , sass = require('node-sass')
  , compass = require('node-compass')
  , routes = require('./routes')  
  , datacenters = require('./routes/datacenters')
  , clusters = require('./routes/clusters')
  , vms = require('./routes/vms')
  , http = require('http')
  , path = require('path')
  , ejs = require('ejs');

var app = express();

app.engine('.json', ejs.renderFile);

ejs.filters.sample = function(arr) {
  var rand = Math.floor(Math.random() * arr.length);
  return arr[rand];
};

ejs.filters.range_rand = function(range) {
  var start = range[0] || 0, end = range[1] | 100;
  var rand = Math.floor(Math.random() * (end - start)) + start;
  return rand;
};


app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(sass.middleware({
      src: __dirname + '/public/stylesheets'
    , dest: __dirname + '/public/stylesheets'
    , debug: true
  }));
  app.use(compass());
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

app.get('/', routes.index);
app.get('/tree_list', routes.tree_list);

app.get('/datacenters/:id', datacenters.show);
app.get('/datacenters/:id/events', datacenters.events);
app.get('/datacenters/:id/top_hosts', datacenters.top_hosts);
app.get('/datacenters/:id/top_vms', datacenters.top_vms);

app.get('/clusters/:id', clusters.show);
app.get('/clusters/:id/top_hosts', clusters.top_hosts);
app.get('/clusters/:id/top_vms', clusters.top_vms);

app.get('/virtual_machies/:id', vms.show)



http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

