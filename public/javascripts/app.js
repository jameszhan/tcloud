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
      when('/vms/:id', {templateUrl: '/partials/vms/overview.html', controller: VMCtrl}).
      when('/template', {templateUrl: '/partials/templates/overview.html', controller: TemplateListCtrl}).
      otherwise({redirectTo: '/'});
}]).run(["$pollingPool", "$timeout", "$rootScope", "Util", "Activity", function($pollingPool, $timeout, $rootScope, Util, Activity){
  $rootScope.$on('$routeChangeStart', function(e, route){
    $pollingPool.clear();
    $pollingPool.add(function(){
      if($rootScope.activities){
        var activity_ids = $rootScope.activities.map(function(activity){return activity.id});
        Activity.status({ids: activity_ids}, function(data){          
          Util.update($rootScope.activities, data);
        });
      }
    });
  });
  $timeout(function(){
    $pollingPool.schedule();
  }, 3000);
}]);
