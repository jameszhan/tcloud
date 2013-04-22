var myLayout;
jQuery(document).ready(function($){
  myLayout = $('body').layout({
    north: {
      closable: false,
      resizable: false,
      spacing_open: 0
    },  
    west:{
      closable: false,
      spacing_open: 5
    },
    south: {
        spacing_open: 5
    }    
  });
});



angular.module('webvirt', ['webvirtDirectives', 'webvirtFilters', "ui.bootstrap.dialog"]).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/datacenters/:id', {templateUrl: '/partials/datacenters/overview.html', controller: DataCenterCtrl}).
      when('/clusters/:id', {templateUrl: '/partials/clusters/overview.html', controller: ClusterCtrl}).
      when('/hosts/:id', {templateUrl: '/partials/hosts/overview.html',   controller: HostCtrl}).
      when('/virtual_machies/:id', {templateUrl: '/partials/vms/overview.html', controller: VMCtrl}).
      when('/vm_setup/step01', {
        popup:{
          templateUrl : 'workflow_step01.html'
        }        
      }).
      otherwise({redirectTo: '/'});
}]);