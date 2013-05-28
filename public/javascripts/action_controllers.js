/******************************* Calendar Start ******************************/
function TaskCalendarCtrl($scope, $dialog, $routeParams, DataCenter, Util){
  var today = Date.begin_of_date(new Date());
  var d = today.getDate(), m = today.getMonth(), y = today.getFullYear();
  $scope.events = [];
  $scope.event_sources = [];   

  $scope.priorities = [{name: '低', value: 10}, {name: '普通', value: 5}, {name: '高', value: 0}];
  $scope.search = {priority:5};    
  angular.forEach($scope.priorities, function(obj){   
    $scope["events_at_" + obj.value] = [];    
    $scope.event_sources.push($scope["events_at_" + obj.value] );
  });
  
  DataCenter.tasks({id: $routeParams.id}, function(data){    
    angular.forEach(data, function(v){   
      $scope["events_at_" + v.priority].push(Util.event_with_color(v));
      $scope.events.push(v);
    });
  });  
  
  $scope.add_task = function() {
    open_dialog(today, null);
  };
  
  $scope.day_click = function(date, all_day, js_event, view){
    if(date > today){
      $scope.$apply(function(){
        open_dialog(date, null);
      });
    }
  };

  $scope.event_on_drop = function(event, day_delta, minute_delta, all_day, revert_func, js_event, ui, view){
    $scope.$apply(function(){
      Util.event_with_color(event);
      DataCenter.update_task({id: $scope.datacenter.id, task: {id: event.id, day_delta: day_delta, minute_delta: minute_delta, all_day: all_day}});
    });
  };

  $scope.event_on_resize = function(event, day_delta, minute_delta, revert_func, js_event, ui, view){
    $scope.$apply(function(){
      $scope.alert_message = ('Event Resized to make dayDelta ' + minute_delta);
    });
  };
  
  $scope.edit_task = function(cal_event, e, view) {
    $scope.$apply(function(){      
      open_dialog(today, cal_event);
    });
  };

  $scope.remove = function(index) {
    $scope.events.splice(index, 1);
  };

  $scope.change_view = function(view) {
    $scope.current_calendar.fullCalendar('changeView', view);
  };

  
  $scope.ui_config = {
    calendar:{
      height: 450,
      editable: true,
      ignoreTimezone: false,
      header:{
        left: 'month basicWeek basicDay',
        center: 'title',
        right: 'agendaWeek agendaDay, today prev,next'
      },
      
      // time formats
    	titleFormat: {
    		month: 'MMMM yyyy',
    		week: "MMMd - {MMMd}",
    		day: 'dddd, MMMd, yyyy'
    	},
    	columnFormat: {
    		month: 'ddd',
    		week: 'ddd M/d',
    		day: 'dddd M/d'
    	},
    	timeFormat: { // for event elements
    		'': 'h(:mm)t' // default
    	},
      
      // locale
    	isRTL: false,
    	firstDay: 0,    	
      monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
    	dayNamesShort: ['日','一','二','三','四','五','六'],
      buttonText: {
    		prev: '&nbsp;&#9668;&nbsp;',
    		next: '&nbsp;&#9658;&nbsp;',
    		prevYear: '&nbsp;&lt;&lt;&nbsp;',
    		nextYear: '&nbsp;&gt;&gt;&nbsp;',
    		today: '今天',
    		month: '月',
    		week: '星期',
    		day: '天'
    	},
      dayClick: $scope.day_click,
      eventDrop: $scope.event_on_drop,
      eventResize: $scope.event_on_resize,
      eventClick: $scope.edit_task
    }
  };  
  
  function open_dialog(date, event){
    $scope.selected_event = event;
    $scope.selected_date = date;
    Util.dialog("/partials/datacenters/_task.html", 'TaskCalendarDialogCtrl', $scope, {backdropClick: false, dialogClass: 'modal mini'});
  }
}

/******************************* Calendar End ******************************/

/******************************* VM Action Start ******************************/
function VMMgmtCtrl($scope, Util){
  $scope.selected || ($scope.selected = {});
  Util.pagination($scope, 'vms', 5);
}

function VMActionBarCtrl($scope, $q, VM, Util){
  $scope.min_msg = "你至少应该选择{0}台虚拟机."
  $scope.max_msg = "你不能选择超过{0}台虚拟机."
  
  $scope.do_create = function(){
    $scope.selected_vm = null;
    Util.dialog("vm_workflow.html", 'VMWorkflowDialogCtrl', $scope, {backdropClick: false});
  };
  
  $scope.do_edit = function() {
    Util.bind($scope, 'vms').select(1, 1).then(function(vms){      
      $scope.selected_vm = vms[0];
      Util.dialog("/partials/vms/vm_config.html", 'VMConfigDialogCtrl', $scope, {backdropClick: false});
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
    Util.bind($scope, 'hosts').select(1, 1).then(function(hosts){
      $scope.selected_host = hosts[0];
      Util.dialog("/partials/hosts/_activate_form.html", 'HostActivateDialogCtrl', $scope, {backdropClick: false});
      //console.log("Activate the hosts " + $scope.selected_host.id);
      //new Host({ids: $scope.selected_host.id}).$activate(Util.update_activities);
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