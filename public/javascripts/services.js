angular.module('webvirtServices', []).factory('currentCluster', function() {
  var currentCluster = null;
  return {
    get: function(){
      return currentCluster;
    },
    set: function(cluster){
     currentCluster = cluster;
    }
  };
}).factory("selectedVM", function(){
  var selectedVM = null;
  return {
    get: function(){
      return selectedVM;
    },
    set: function(vm){
     selectedVM = vm;
    }
  };
}).factory('DataCenter', function($resource) {
  return $resource('datacenters/:id', {id: '@id'}, {get: {method: 'GET'}});
}).factory('DataCenterEvent', function($resource){
  return $resource('datacenters/:data_center_id/events/:id', {data_center_id: '@data_center_id',id: '@id'}, {
    get: {method: 'GET'},
    query: {method: 'GET', isArray: true}
  });
}).factory('Cluster', function($resource){
  return $resource('clusters/:id', {id: '@id'}, {get: {method: 'GET'}});
}).factory('VMService', function($resource){
  return $resource('vms/:id', {id: '@id'}, {    
    'status': {method: 'POST', isArray: true, url: 'vms/status'},
    'delete_all': {method: 'POST', url: 'vms/delete_all'}, 
    'save_template': {method: 'POST', url: 'vms/save_template'},
    'migrate': {method: 'POST', url: 'vms/migrate'},
    'suspend': {method: 'POST', url: 'vms/suspend'},  
    'start': {method: 'POST', url: 'vms/start'},  
    'shutdown': {method: 'POST', url: 'vms/shutdown'},   
    'reboot': {method: 'POST', url: 'vms/reboot'},
    'snapshot': {method: 'POST', url: 'vms/snapshot'}
  })
}).factory('Host', function($resource){
  return $resource('hosts/:id', {id: '@id'}, {get: {method: 'GET'}});
});




/*
.angular.service('VM', function($resource) {
   return $resource('vms/:id', {}, { 
     'save': { method: 'POST' },
     'get': { method: 'GET' },
     'query': { method: 'GET', isArray: true },
     'update': { method: 'PUT' },
     'delete': { method: 'DELETE' }});
});
*/