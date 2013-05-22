/******************************* Calendar Start ******************************/
function TaskCalendarCtrl($scope, $dialog, $routeParams, DataCenter, Util){
  $scope.events = [];
  $scope.event_sources = [$scope.events];
  var today = new Date();
  var d = today.getDate();
  var m = today.getMonth();
  var y = today.getFullYear();
  
  $scope.day_click = function(date, all_day, js_event, view){
    $scope.$apply(function(){
      $scope.current_date = date;
      Util.dialog("/partials/datacenters/_task.html", 'TaskCalendarDialogCtrl', $scope, {backdropClick: false});
    });
  };

  $scope.event_on_drop = function(event, day_delta, minute_delta, all_day, revert_func, js_event, ui, view){
    $scope.$apply(function(){
      DataCenter.update_task({id: $scope.datacenter.id, task: {id: event.id, day_delta: day_delta, minute_delta: minute_delta, all_day: all_day}});
    });
  };

  $scope.event_on_resize = function(event, day_delta, minute_delta, revert_func, js_event, ui, view ){
    $scope.$apply(function(){
      $scope.alert_message = ('Event Resized to make dayDelta ' + minute_delta);
    });
  };

  $scope.add_task = function() {
    $scope.current_date = today;
    Util.dialog("/partials/datacenters/_task.html", 'TaskCalendarDialogCtrl', $scope, {backdropClick: false});
  };

  $scope.remove = function(index) {
    $scope.events.splice(index, 1);
  };

  $scope.change_view = function(view) {
    $scope.current_calendar.fullCalendar('changeView', view);
  };
  
  DataCenter.tasks({id: $routeParams.id}, function(data){
    angular.forEach(data, function(v){
      $scope.events.push(v);
    });
  });
  
  $scope.ui_config = {
    calendar:{
      height: 450,
      editable: true,
      header:{
        left: 'month basicWeek basicDay agendaWeek agendaDay',
        center: 'title',
        right: 'today prev,next'
      },
      dayClick: $scope.day_click,
      eventDrop: $scope.event_on_drop,
      eventResize: $scope.event_on_resize
    }
  };
}

/******************************* Calendar End ******************************/

/******************************* VM Action Start ******************************/
function VMMgmtCtrl($scope, Util){
  $scope.selected || ($scope.selected = {});
    
  Util.pagination($scope, 'vms', 5);
}

function VMActionBarCtrl($scope, $q, $dialog, VM, Util){
  var d = $dialog.dialog({
    backdrop: true,
    keyboard: true,
    backdropClick: false,
    templateUrl: "",
    controller: ''
  });
  
  $scope.min_msg = "你至少应该选择{0}台虚拟机."
  $scope.max_msg = "你不能选择超过{0}台虚拟机."
  
  $scope.do_create = function(){
    $scope.selected_vm = null;
    Util.dialog("vm_workflow.html", 'VMWorkflowDialogCtrl', $scope, {backdropClick: false});
  };
  
  $scope.do_edit = function() {
    d.context_scope = $scope;
    Util.bind($scope, 'vms').select(1, 1).then(function(vms){      
      $scope.selected_vm = vms[0];
      Util.dialog("vm_workflow.html", 'VMWorkflowDialogCtrl', $scope, {backdropClick: false});
    });
  };
  
  $scope.do_delete = function(){
    Util.bind($scope, 'vms').select(1, 100).confirm("你确定要删除它们吗，此操作将无法恢复!").then(function(vms){
      var vm_ids = vms.map(function(vm){return vm.id;});
      console.log("DELETE ALL VMS " + vm_ids);
      new VM({ids: vm_ids}).$delete_all(function(data){
        if(data.success){
          angular.forEach(vms, function(vm){
            var index = $scope.vms.indexOf(vm);
            $scope.vms.splice(index, 1);
          });
          $scope.unselected_all();
          Util.update_activities(data);
        }
      });
    }); 
  };

  $scope.do_template = function(){
    Util.bind($scope, 'vms').select(1, 1).then(function(vms){
      $scope.selected_vm = vms[0];
      Util.dialog("/partials/vms/template_dialog.html", 'SaveAsTemplateDialogCtrl', $scope, {backdropClick: false});
    }); 
  };
  
  $scope.do_migrate = function(){
    Util.bind($scope, 'vms').select(1, 1).then(function(vms){
      $scope.selected_vm = vms[0];
      Util.dialog("/partials/vms/migrate_dialog.html", 'VMMigrateDialogCtrl', $scope, {backdropClick: false});
    }); 
  };
  
  $scope.do_suspend = function(){
    Util.bind($scope, 'vms').select(1, 100).confirm("你确定要暂停它(们)吗!").then(function(vms){
      var vm_ids = vms.map(function(vm){ return vm.id; });
      console.log("Suspend VMS " + vm_ids);
      new VM({ids: vm_ids}).$suspend(Util.update_activities);
    }); 
  };
  
  $scope.do_start = function(){
    Util.bind($scope, 'vms').select(1, 100).confirm("你确定要启动它(们)吗？").then(function(vms){
      var vm_ids = vms.map(function(vm){ return vm.id; });
      console.log("Start VMS " + vm_ids);
      new VM({ids: vm_ids}).$start(Util.update_activities);
    }); 
  };
  
  $scope.do_reboot = function(){
    Util.bind($scope, 'vms').select(1, 100).confirm("你确定要删要重启它(们)吗？").then(function(vms){
      var vm_ids = vms.map(function(vm){return vm.id});
      console.log("Restart VMS " + vm_ids);
      new VM({ids: vm_ids}).$reboot(Util.update_activities);
    }); 
  };
  
  $scope.do_shutdown = function(){
    Util.bind($scope, 'vms').select(1, 100).confirm("你确定要关闭它(们)吗").then(function(vms){
      var vm_ids = vms.map(function(vm){return vm.id});
      console.log("Shutdown VMS " + vm_ids);
      new VM({ids: vm_ids}).$shutdown(Util.update_activities);
    }); 
  };
  
  $scope.do_snapshot = function(){
    Util.bind($scope, 'vms').select(1, 100).confirm("确定要创建快照吗？").then(function(vms){
      var vm_ids = vms.map(function(vm){return vm.id});
      console.log("Snapshot VMS " + vm_ids);
      new VM({ids: vm_ids}).$snapshot(Util.update_activities);
    }); 
  };
  
  $scope.do_operate = function(){
    Util.bind($scope, 'vms').select(1, 100).confirm("运营管理?").then(function(vms){
      var vm_ids = vms.map(function(vm){return vm.id});
      console.log("operation VMS " + vm_ids);
      new VM({ids: vm_ids}).$operate(Util.update_activities);
    });
  };
}
/******************************* VM Action End ******************************/

/******************************* Host Action Start ******************************/
function HostMgmtCtrl($scope, Util){  
  $scope.selected || ($scope.selected = {});
  
  $scope.show_details = function(){
    $scope.selected_host = this.m;
  };
  
  Util.pagination($scope, 'hosts', 5);
}


function HostActionBarCtrl($scope, $dialog, Host, Util){    
  $scope.min_msg = "你至少应该选择{0}台主机."
  $scope.max_msg = "你不能选择超过{0}台主机."
  
  $scope.do_add = function(){
    $scope.selected_host = null;
    Util.dialog("/partials/hosts/_form.html", 'HostUpsertDialogCtrl', $scope, {backdropClick: false});
  };
  
  $scope.do_edit = function() {
    Util.bind($scope, 'hosts').select(1, 1).then(function(hosts) {
      $scope.selected_host = hosts[0];
      Util.dialog("/partials/hosts/_form.html", 'HostUpsertDialogCtrl', $scope, {backdropClick: false});
    });
  };
  
  $scope.do_remove = function(){
    Util.bind($scope, 'hosts').select(1, 100).confirm('你确定要移除它们吗，此操作将无法恢复!').then(function(hosts){
      var host_ids = hosts.map(function(host){return host.id;});
      console.log("REMOVE ALL HOSTS " + host_ids);
      new Host({ids: host_ids}).$remove_all(function(data){
        if(data.success){
          angular.forEach(hosts, function(host){
            var index = $scope.hosts.indexOf(host);
            $scope.hosts.splice(index, 1);
          });
          $scope.unselected_all();
          Util.update_activities(data);
        }
      });
    });
  };

  $scope.do_maintain = function(){
    Util.bind($scope, 'hosts').select(1, 100).confirm('确定要进行维护操作？').then(function(hosts){
      var host_ids = hosts.map(function(host){ return host.id; });
      console.log("Maintain the hosts " + host_ids);
      new Host({ids: host_ids}).$maintain(Util.update_activities);
    });
  };
  
  $scope.do_activate = function(){
    Util.bind($scope, 'hosts').select(1, 100).confirm('确定要进行激活操作？').then(function(hosts){
      var host_ids = hosts.map(function(host){ return host.id; });
      console.log("Activate the hosts " + host_ids);
      new Host({ids: host_ids}).$activate(Util.update_activities);
    });
  };  

  $scope.do_start = function(){
    Util.bind($scope, 'hosts').select(1, 100).confirm('确定要进行启动操作？').then(function(hosts){
      var host_ids = hosts.map(function(host){ return host.id; });
      console.log("Start the hosts " + host_ids);
      new Host({ids: host_ids}).$start(Util.update_activities);
    });
  };
  
  $scope.do_shutdown = function(){
    Util.bind($scope, 'hosts').select(1, 100).confirm('确定要进行关机操作？').then(function(hosts){
      var host_ids = hosts.map(function(host){ return host.id; });
      console.log("Shutdown the hosts " + host_ids);
      new Host({ids: host_ids}).$shutdown(Util.update_activities);
    });
  };
  
  $scope.do_reboot = function(){
    Util.bind($scope, 'hosts').select(1, 100).confirm('确定要进行重启操作？').then(function(hosts){
      var host_ids = hosts.map(function(host){ return host.id; });
      console.log("Reboot the hosts " + host_ids);
      new Host({ids: host_ids}).$reboot(Util.update_activities);
    });
  };
  
}

/******************************* Host Action End ******************************/