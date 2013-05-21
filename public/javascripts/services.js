angular.module('webvirtServices', [])
  .factory('DataCenter', function($resource) {
    return $resource('datacenters/:id', {id: '@id'}, {
      get: {method: 'GET'},
      tasks: {method: 'GET', isArray: true, url: "datacenters/:id/tasks"},
      backups: {method: 'GET', isArray: true, url: "datacenters/:id/backups"},
      add_task: {method: 'POST', url: "datacenters/:id/add_task"},
      update_task: {method: 'POST', url: "datacenters/:id/update_task"}
    });
  })
  .factory('DataCenterEvent', function($resource){
    return $resource('datacenters/:data_center_id/events/:id', {data_center_id: '@data_center_id',id: '@id'}, {
      get: {method: 'GET'},
      query: {method: 'GET', isArray: true},
      delete_all: {method: 'POST', url: 'datacenters/:data_center_id/events/delete_all'}
    });
  })
  .factory('Cluster', function($resource){
    return $resource('clusters/:id', {id: '@id'}, {
      'backups': {method: 'GET', isArray: true, url: "clusters/:id/backups"},
      'backup_strategy': {method: 'GET', isArray: true, url: "clusters/:id/backup_strategy"},
      'backup_status': {method: 'GET', url: "clusters/:id/backup_status"}      
    });
  })
  .factory('VM', function($resource){
    return $resource('vms/:id', {id: '@id', backup_id: '@backup_id'}, {    
      'status': {method: 'POST', isArray: true, url: 'vms/status'},
      'update': {method: 'PUT'},
      'delete_all': {method: 'POST', url: 'vms/delete_all'}, 
      'save_template': {method: 'POST', url: 'vms/:id/save_template'},
      'migrate': {method: 'POST', url: 'vms/:id/migrate'},
      'suspend': {method: 'POST', url: 'vms/suspend'},  
      'start': {method: 'POST', url: 'vms/start'},  
      'shutdown': {method: 'POST', url: 'vms/shutdown'},   
      'reboot': {method: 'POST', url: 'vms/reboot'},
      'snapshots': {method: 'GET', url: 'vms/:id/snapshots', isArray: true},
      'delete_snapshots': {method: 'POST', url: 'vms/:id/delete_snapshots'},
      'snapshot': {method: 'POST', url: 'vms/snapshot'},
      'operate': {method: 'POST', url: 'vms/operate'},
      'reset_backup': {method: 'POST', url: 'vms/:id/backups/:backup_id/reset'},
      'migration_hosts': {method: 'GET', isArray: true, url: 'vms/:id/migration_hosts'}
    })
  })
  .factory('Host', function($resource){
    return $resource('hosts/:id', {id: '@id'}, {
      'update': {method: 'PUT'},      
      'backups': {method: 'GET', isArray: true, url: "hosts/:id/backups"},
      'status': {method: 'POST', isArray: true, url: 'hosts/status'},
      "remove_all": {method: 'POST', url: "hosts/remove_all"},
      "start": {method: 'POST', url: "hosts/start"},
      "shutdown": {method: 'POST', url: "hosts/shutdown"},
      "reboot": {method: 'POST', url: "hosts/reboot"},
      "activate": {method: 'POST', url: "hosts/activate"},
      "maintain": {method: 'POST', url: "hosts/maintain"}
    });
  })
  .factory('Template', function($resource) {
    return $resource('templates/:id', {id: '@id'}, {
      'delete_all': {method: 'POST', url: 'templates/delete_all'}
    });
  })
  .factory('Activity', function($resource){
    return $resource('activities/:id', {id: '@id'}, {
      'status': {method: 'POST', isArray: true, url: 'activities/status'},
    });
  })
  .factory('SecurityRule', function($resource){
    return $resource('security_rules/:id', {id: '@id'}, {
      'update': {method: 'PUT'},
      'delete_all': {method: 'POST', url: 'security_rules/delete_all'}
    });
  })
  .factory('Network', function($resource){
    return $resource('networks/:id', {id: '@id'}, {      
      'update': {method: 'PUT'},
      'status': {method: 'POST', isArray: true, url: 'networks/status'},
      'delete_network_all': {method: 'POST', url: 'networks/delete_all'}
    });
  })
  .factory('Storage', function($resource){
    return $resource('storages/:id', {id: '@id'}, {
      'update': {method: 'PUT'},
      'status': {method: 'POST', isArray: true, url: 'storages/status'},
      'delete_all': {method: 'POST', url: 'storages/delete_all'}
    });
  })
  .factory('Shortcut', function($resource){
    return $resource('shortcuts/:id', {id: '@id'}, {
      'status': {method: 'POST', isArray: true, url: 'shortcuts/status'},
      'delete_all': {method: 'POST', url: 'shortcuts/delete_all'}
    });
  })
  .factory('Proposal', function($resource){
    return $resource('proposals/:id', {id: '@id'}, {
      'update': {method: 'PUT'},
      'status': {method: 'POST', isArray: true, url: 'proposals/status'},
      'delete_all': {method: 'POST', url: 'proposals/delete_all'}
    });
  })
  .factory('BackupStrategy', function($resource){
    return $resource('backupstrategys/:id', {id: '@id'}, {
      'update': {method: 'PUT'},
      'status': {method: 'POST', isArray: true, url: 'backupstrategys/status'},
      'delete_all': {method: 'POST', url: 'backupstrategys/delete_all'}
    });
  });
