angular.module('webvirtContextMenu', []).factory('ContextMenu', function($rootScope){
  var root = $('#right-click-menu'), context_menu = null;
  function find_context_menu(url){
     var context_class = ".datacenters";
      //var $scope = locals.$scope ? locals.$scope : $rootScope.$new();
      switch(true){
        case /^#\/datacenters/.test(url):
          context_class = ".datacenters";
          break;
        case /^#\/clusters\/(\d+)/.test(url):
          context_class = ".clusters";
          $rootScope.$emit('event:cluster-selected', {id: RegExp.$1});
          break;
        case /^#\/hosts\/(\d+)/.test(url):
          context_class = ".hosts";
          $rootScope.$emit('event:host-selected', {id: RegExp.$1});
          break;
        case /^#\/vms\/(\d+)/.test(url):
          $rootScope.$emit('event:vm-selected', {id: RegExp.$1});
          context_class = ".vms";
          break;
      }
      context_menu = root.find(context_class);
      return context_menu;
  }
  function hide_context_menu(){
    if(context_menu){
      context_menu.css({"visibility":"hidden"});
    }
    $("body").unbind("mousedown", body_mousedown);
  }
  function body_mousedown(e) {
    if (!(e.target.id == "right-click-menu" || $(e.target).parents("#right-click-menu").length > 0)) {
      context_menu.css({"visibility":"hidden"});
    }
  }
  return {
    find_context_menu: find_context_menu,
    hide_context_menu: hide_context_menu,
    body_mousedown: body_mousedown
  }
});


function ContextMenuCtrl($rootScope, $scope, Util){
  $scope.add_cluster = function(){
    Util.dialog("/partials/clusters/_add_cluster_dialog.html", 'ClusterConfigCtrl', $scope, {dialogClass: 'modal mini'});
  }

  $scope.add_storage = function(){
    Util.dialog("/partials/storages/_storage_dialog.html", 'StorageConfigDialogCtrl', $scope, {dialogClass: 'modal mini'});
  };
  
  $scope.add_network = function(){
    Util.dialog("/partials/networks/_network_dialog.html", 'NetworkConfigDialogCtrl', $scope);
  }
}

function DataCenterContextMenuCtrl(){}
function ClusterContextMenuCtrl($rootScope, $scope, Cluster, Util){
  $scope.add_host = function(){
    Util.dialog("/partials/hosts/_form.html", 'HostUpsertDialogCtrl', $scope, {dialogClass: 'modal mini'});
  }
  
  $rootScope.$on('event:cluster-selected', function(e, args) {
    Cluster.get({id: args.id}, function(cluster){
      $scope.cluster = cluster;
    });
  });
};

function HostContextMenuCtrl($rootScope, $scope, Host, VM, Util){
  $rootScope.$on('event:host-selected', function(e, args) {
    Host.get({id: args.id}, function(host){
      $scope.host = host;      
      
      $scope.do_start = function(){
        new Host({ids: [$scope.host.id]}).$start(Util.update_activities);
      };

      $scope.do_shutdown = function(){
        new Host({ids: [$scope.host.id]}).$shutdown(Util.update_activities);
      };

      $scope.do_reboot = function(){
        new Host({ids: [$scope.host.id]}).$reboot(Util.update_activities);
      };
      
            
      $scope.do_maintain = function(){
        new Host({ids: [$scope.host.id]}).$maintain(Util.update_activities);
      }
      
      $scope.do_remove = function(){
        new Host({ids: [$scope.host.id]}).$remove_all(Util.update_activities);
      }
      
      $scope.add_vm = function(){
        Util.dialog("vm_workflow.html", 'VMWorkflowDialogCtrl', $scope);
      }
      
      $scope.start_all_vms = function(){
        var vm_ids = $scope.host.virtual_machines.map(function(vm){ return vm.id; });
        new VM({ids: vm_ids}).$start(Util.update_activities);
      }
      $scope.shutdown_all_vms = function(){
        var vm_ids = $scope.host.virtual_machines.map(function(vm){ return vm.id; });
        new VM({ids: vm_ids}).$shutdown(Util.update_activities);
      }
    });
  }); 
};


function VMContextMenuCtrl($rootScope, $scope, VM, Util){
  $rootScope.$on('event:vm-selected', function(e, args) {
    VM.get({id: args.id}, function(vm){
      $scope.vm = vm;
      $scope.selected_vm = vm;      
      $scope.do_edit = function() {
        Util.dialog("vm_workflow.html", 'VMWorkflowDialogCtrl', $scope);
      };

      $scope.do_delete = function(){
        new VM({ids: [$scope.vm.id]}).$delete_all(Util.update_activities); 
      };
      
      $scope.do_migrate = function(){
        Util.dialog("/partials/vms/migrate_dialog.html", 'VMMigrateDialogCtrl', $scope, {dialogClass: 'modal mini'});
      };

      $scope.do_suspend = function(){
        new VM({ids: [$scope.vm.id]}).$suspend(Util.update_activities);
      };

      $scope.do_start = function(){
        new VM({ids: [$scope.vm.id]}).$start(Util.update_activities);
      };

      $scope.do_reboot = function(){
        new VM({ids: [$scope.vm.id]}).$reboot(Util.update_activities);
      };

      $scope.do_shutdown = function(){
        new VM({ids: [$scope.vm.id]}).$shutdown(Util.update_activities);
      };

      $scope.do_snapshot = function(){
        new VM({ids: [$scope.vm.id]}).$snapshot(Util.update_activities);
      };

    });
  });
}