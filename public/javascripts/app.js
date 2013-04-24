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



angular.module('webvirt', ['webvirtDirectives', 'webvirtServices', 'webvirtFilters', "ui.bootstrap.dialog", "ngResource"]).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/datacenters/:id', {templateUrl: '/partials/datacenters/overview.html', controller: DataCenterCtrl}).
      when('/clusters/:id', {templateUrl: '/partials/clusters/overview.html', controller: ClusterCtrl}).
      when('/hosts/:id', {templateUrl: '/partials/hosts/overview.html',   controller: HostCtrl}).
      when('/virtual_machies/:id', {templateUrl: '/partials/vms/overview.html', controller: VMCtrl}).
      otherwise({redirectTo: '/'});
}]).run(["$pollingPool", "$timeout", "$rootScope", function($pollingPool, $timeout, $rootScope){
  $rootScope.$on('$routeChangeStart', function(e, route){
    $pollingPool.clear();
    $timeout(function(){
      $pollingPool.schedule();
    }, 3000);
  });
}]);
