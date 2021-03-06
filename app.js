/**
 * Module dependencies.
 */

var express = require('express')
  , strftime = require('strftime')
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
  , proposals = require('./routes/proposals')
  , backups = require('./routes/backups')
  , backupstrategys = require('./routes/backupstrategys')
  , securityrules = require('./routes/securityrules')
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
    , style: 'compact'
    , output_style: 'compact'
    , outputStyle: 'compact'
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
app.post('/datacenters/:id/events/delete_all', datacenters.event_delete);
app.get('/datacenters/:id/top_hosts', datacenters.top_hosts);
app.get('/datacenters/:id/top_vms', datacenters.top_vms);
app.get('/datacenters/:id/backups', datacenters.backups);
app.get('/datacenters/:id/tasks', datacenters.tasks);
app.post('/datacenters/:id/add_task', datacenters.add_task);
app.post('/datacenters/:id/update_task', datacenters.update_task);

app.get('/clusters/:id', clusters.show);
app.get('/clusters/:id/top_hosts', clusters.top_hosts);
app.get('/clusters/:id/top_vms', clusters.top_vms);

app.get('/hosts/:id', hosts.show);
app.post('/hosts', hosts.save);
app.put('/hosts/:id', hosts.update);
app.get('/hosts/:id/backups', hosts.backups);
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
app.get('/hosts/:id/:type', hosts.monitoring);
app.get('/hosts/:id/:type/:start/:finish', hosts.monitoring);

app.get('/vms/:id', vms.show);
app.get('/vms/:id/current_cpu', vms.current_cpu);
app.get('/vms/:id/current_memory', vms.current_memory);
app.get('/vms/:id/current_traffic', vms.current_traffic);
app.post('/vms/delete_all', vms.delete_all);
app.post('/vms/:id/save_template', vms.save_template);
app.post('/vms/:id/migrate', vms.migrate);
app.post('/vms/suspend', vms.suspend);
app.post('/vms/start', vms.start);
app.post('/vms/reboot', vms.reboot);
app.post('/vms/shutdown', vms.shutdown);
app.get('/vms/:id/snapshots', vms.snapshots);
app.post('/vms/:id/delete_snapshots', vms.delete_snapshots);
app.post('/vms/snapshot', vms.snapshot);
app.post('/vms/status', vms.status);
app.post('/vms/operate', vms.operate);
app.post('/vms/:id/backups/:backup_id/reset', vms.reset_backup);
app.get('/vms/:id/migration_hosts', vms.migration_hosts);
app.post('/vms', vms.save);
app.put('/vms/:id', vms.update);

app.get('/templates', templates.index);
app.post('/templates/delete_all', templates.delete_all);

app.get('/activities', activities.index);
app.post('/activities/status', activities.status);

app.get('/networks', networks.index);
app.get('/networks/security_rules', networks.security_rules);
app.post('/networks/delete_security_rules', networks.delete_security_rules);
app.post('/networks', networks.save);
app.put('/networks/:id', networks.update);
app.post('/networks/status', networks.status);
app.post('/networks/delete_all', networks.delete_all);

app.get('/security_rules', securityrules.index);
app.get('/security_rules/:id', securityrules.show);
app.post('/security_rules', securityrules.save);
app.put('/security_rules/:id', securityrules.update);
app.post('/security_rules/delete_all', securityrules.delete_all);


app.get('/storages', storages.index);
app.post('/storages', storages.save);
app.put('/storages/:id', storages.update);
app.post('/storages/status', storages.status);
app.post('/storages/delete_all', storages.delete_all);

app.get('/shortcuts', shortcuts.index);
app.post('/shortcuts/status', shortcuts.status);
app.post('/shortcuts/delete_all', shortcuts.delete_all);

app.get('/proposals', proposals.index);
app.put('/proposals/:id', proposals.update);
app.post('/proposals/status', proposals.status);
app.post('/proposals/delete_all', proposals.delete_all);


app.get('/backups', backups.index);
app.post('/backups', backups.save);
app.put('/backups/:id', backups.update);
app.get('/backups/status', backups.status);
app.post('/backups/delete_all', backups.delete_all);

app.get('/backup_strategies', backupstrategys.index);
app.post('/backup_strategies', backupstrategys.save);
app.put('/backup_strategies/:id', backupstrategys.update);
app.post('/backup_strategies/status', backupstrategys.status);
app.post('/backup_strategies/delete_all', backupstrategys.delete_all);


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

