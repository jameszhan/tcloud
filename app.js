
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
  , hosts = require('./routes/hosts')
  , templates = require('./routes/templates')
  , networks = require('./routes/networks')
  , activities = require('./routes/activities')
  , storages = require('./routes/storages')
  , shortcuts = require('./routes/shortcuts')
  , http = require('http')
  , path = require('path')
  , ejs = require('ejs');

var app = express();

app.engine('.json', ejs.renderFile);

ejs.filters.sample = function(arr) {
  var rand = Math.floor(Math.random() * arr.length);
  return arr[rand];
};


ejs.filters.range = function(start, end) {
  var arr = [];
  for(var i = start; i < end; i++){
    arr.push(i);
  }
  return arr;
};

ejs.filters.range_rand = function(range) {
  var start = range[0] || 0, end = range[1] || 100;
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

app.get('/hosts/:id', hosts.show);
app.post('/hosts', hosts.save);
app.get('/hosts/:id/current_cpu', hosts.current_cpu);
app.get('/hosts/:id/current_memory', hosts.current_memory);
app.get('/hosts/:id/current_traffic', hosts.current_traffic);
app.post('/hosts/status', hosts.status);
app.post('/hosts/maintain', hosts.maintain);
app.post('/hosts/activate', hosts.activate);
app.post('/hosts/start', hosts.start);
app.post('/hosts/reboot', hosts.reboot);
app.post('/hosts/shutdown', hosts.shutdown);
app.post('/hosts/remove_all', hosts.remove_all);

app.get('/vms/:id', vms.show);
app.get('/vms/:id/current_cpu', vms.current_cpu);
app.get('/vms/:id/current_memory', vms.current_memory);
app.get('/vms/:id/current_traffic', vms.current_traffic);
app.post('/vms/delete_all', vms.delete_all);
app.post('/vms/save_template', vms.save_template);
app.post('/vms/migrate', vms.migrate);
app.post('/vms/suspend', vms.suspend);
app.post('/vms/start', vms.start);
app.post('/vms/reboot', vms.reboot);
app.post('/vms/shutdown', vms.shutdown);
app.post('/vms/snapshot', vms.snapshot);
app.post('/vms/status', vms.status);

app.get('/templates', templates.index);

app.get('/activities', activities.index);
app.post('/activities/status', activities.status);

app.get('/networks', networks.index);

app.get('/storages', storages.index);

app.get('/shortcuts', shortcuts.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

