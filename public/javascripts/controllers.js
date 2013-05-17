var flatten = function(arr, target){
  var ret = [];
  for(var i = 0; i < arr.length; i++){
    if(arr[i][target] instanceof Array){
      for(var j = 0; j < arr[i][target].length; j++){
        ret.push(arr[i][target][j]);
      }
    }else{
      ret.push(arr[i][target]);
    }      
  }      
  return ret;
};

function ActivityCtrl($rootScope, Activity, Shortcut){
  Activity.query({}, function(data){    
    $rootScope.activities = data;
  });
  Shortcut.query({},function(data){
    $rootScope.shortcuts = data;
  });
}

function TaskCalCtrl($scope, dialog, DataCenter){
  $scope.task = {};
  $scope.title = "添加任务";
  $scope.close = function(result){
    dialog.close(result)
  };
  $scope.save_task = function(){
    DataCenter.add_task({id: dialog.context_scope.datacenter.id, task: $scope.task}, function(task){
      dialog.context_scope.events.push(task);
      dialog.close();
    });
  };
  if(dialog.context_scope.current_date){
    $scope.task.start = dialog.context_scope.current_date;
    $scope.task.end = dialog.context_scope.current_date;
  }
}

function DataCenterCtrl($rootScope, $scope, $routeParams, $location, $dialog, DataCenter, Host, VM, $pollingPool, Util) {
  $scope.events = [];
  $scope.eventSources = [$scope.events];
  var date = new Date();
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();
  
  var d = $dialog.dialog({
    backdrop: true,
    keyboard: true,
    backdropClick: false,
    templateUrl: "/partials/datacenters/_task.html",
    controller: 'TaskCalCtrl'
  });  
  
  $scope.day_click = function(date, all_day, js_event, view){
    $scope.$apply(function(){
      d.context_scope = $scope;
      d.context_scope.current_date = date;
      d.open().then(function(result){
        if(result){
          alert('dialog closed with result: ' + result);
        }
      });
    });
  };

  $scope.event_on_drop = function(event, day_delta, minute_delta, all_day, revert_func, js_event, ui, view){
    $scope.$apply(function(){
      DataCenter.update_task({id: $scope.datacenter.id, task: {id: event.id, day_delta: day_delta, minute_delta: minute_delta, all_day: all_day}});
    });
  };

  $scope.event_on_resize = function(event, dayDelta, minuteDelta, revertFunc, jsEvent, ui, view ){
    $scope.$apply(function(){
      $scope.alertMessage = ('Event Resized to make dayDelta ' + minuteDelta);
    });
  };

  $scope.add_task = function() {
    d.context_scope = $scope;
    d.context_scope.current_date = null;
    d.open().then(function(result){
      if(result){
        alert('dialog closed with result: ' + result);
      }
    });
  };

  $scope.remove = function(index) {
    $scope.events.splice(index, 1);
  };

  $scope.change_view = function(view) {
    $scope.currentCalendar.fullCalendar('changeView', view);
  };
  
  $scope.uiConfig = {
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
  
  DataCenter.tasks({id: $routeParams.id}, function(data){
    angular.forEach(data, function(v){
      $scope.events.push(v);
    });
  });
  
  DataCenter.get({id: $routeParams.id}, function(datacenter){
    $scope.datacenter = datacenter;
    $scope.clusters = $scope.datacenter.clusters;
    $rootScope.hosts = Util.flatten($scope.clusters, 'hosts');
    $scope.hosts = $rootScope.hosts;
    $rootScope.vms = Util.flatten($scope.hosts, 'virtual_machines');
    $scope.vms = $rootScope.vms; 

    $pollingPool.add(function(){
      var vm_ids = $scope.vms.map(function(vm){return vm.id});
      VM.status({ids: vm_ids}, function(data){
        Util.update($scope.vms, data);
      });
      var host_ids = $scope.hosts.map(function(host){return host.id});
      Host.status({ids: host_ids}, function(data){
        Util.update($scope.hosts, data);
      });
    });
  });

  Util.bind_tab($scope);
  
  $scope.add_bookmark = function(){
    var name="DataCenter ";
    var subname = $scope.shortcut_name;
    if(subname && subname != "overview"){
      name += subname;
    }
    shortcut = {
      "id": 6,
      "name": name,
      "url": $scope.location,
      "desc": "Datacenter快捷方式"
    };
    if(confirm("添加书签?")){
      Util.bookmark(shortcut); 
    }
  };  
}

function DataCenterEventCtrl($scope, $routeParams, DataCenterEvent, Util){
  DataCenterEvent.query({data_center_id: $routeParams.id}, function(events, headersFn){
    $scope.events = events;
  });

  $scope.delete_all = function(id){
    if(confirm("你确定要删除它们吗，此操作将无法恢复!")){
      console.log("DELETE event " + id);
      new DataCenterEvent({data_center_id: $routeParams.id, id: id}).$delete_all(function(data){
        if(data.success){
          angular.forEach(events, function(event){
            var index = $scope.events.indexOf(event);
            $scope.events.splice(index, 1);
          });
          Util.update_activities(data);
        }
      });
    }
  }
}

function ClusterCtrl($rootScope, $scope, $routeParams, Cluster, Host, VM, $pollingPool, Util, $location) {
  Cluster.get({id: $routeParams.id}, function(cluster){
    $scope.cluster = cluster;
    $rootScope.hosts = cluster.hosts;
    $scope.hosts = $rootScope.hosts;
    $rootScope.vms = Util.flatten($scope.hosts, 'virtual_machines');
    $scope.vms = $rootScope.vms;

    $pollingPool.add(function(){
      var vm_ids = $scope.vms.map(function(vm){return vm.id});
      VM.status({ids: vm_ids}, function(data){
        Util.update($scope.vms, data);
      });
      var host_ids = $scope.hosts.map(function(host){return host.id});
      Host.status({ids: host_ids}, function(data){
        Util.update($scope.hosts, data);
      });
    });
  });

  Util.bind_tab($scope);
  
  $scope.add_bookmark = function(){
    var name="Cluster ";
    var subname = $scope.shortcut_name;
    if(subname && subname != "overview"){
      name += subname;
    }
    shortcut = {
      "id": "61"+$routeParams.id,
      "name": name,
      "url": $scope.location,
      "desc": "Cluster快捷方式"
    };
    if(confirm("添加书签?")){
      Util.bookmark(shortcut); 
    }
  };  
}

function MonitoringCtrl($scope, $http, $timeout){
  $scope.template = {
    url: "/partials/shared/_monitoring_list.html"
  };
  $scope.targets = [{name: 'CPU', type: 'cpu'}, {name: 'Memory', type: 'memory'}, {name: 'Disk', type: 'disk'}];
  $scope.intervals = [{name: '1秒', value: '1000'}, {name: '3秒', value: '3000'}, {name: '10秒', value: '10000'}, {name: '30秒', value: '30000'}, {name: '1分', value: '60000'}, {name: '10分', value: '100000'}];
  $scope.monitoring = {
    start: "2013-01-01",
    finish: "2013-08-01"
  };
  $scope.monitoring.target = $scope.targets[0]; 
  $scope.monitoring.interval = $scope.intervals[1];  
  
  $scope.show_details = function(host){
    $scope.host = host;
    $scope.template.url = "/partials/shared/_monitoring_details.html";
    show_target_image();
  };
  $scope.go_back = function(){
    $scope.host = null;
    $scope.template.url = "/partials/shared/_monitoring_list.html";
  };
  
  $scope.show_target_image = show_target_image;
  
  function show_target_image(){
    if($scope.host){
      var url = "hosts/" + $scope.host.id + "/" + $scope.monitoring.target.type + "/" 
        + $scope.monitoring.start + "/" + $scope.monitoring.finish;
      console.log(url);
      $scope.monitoring.image = url;
    }
  }
  
  
  /*
  function show_target_image(){
    if($scope.host){
      var url = "hosts/" + $scope.host.id + "/" + $scope.monitoring.target.type;
      $scope.monitoring.image = url;
      $timeout(show_target_image, $scope.monitoring.interval.value);      
    }
  }*/
}

function BackupCtrl($scope, $routeParams, Cluster, VM, Util) {
  Cluster.backup_strategy({id: $routeParams.id}, function(data){
    $scope.backup_strategies = data;
  });
  
  Cluster.backup_status({id: $routeParams.id}, function(data){
    $scope.backup_status = data;
  });  
  
  Cluster.backups({id: $routeParams.id}, function(data){
    $scope.backups = data;
  });
  
  $scope.do_reset = function(backup){
    VM.reset_backup({id: backup.instance.id, backup_id: backup.id}, Util.update_activities);
  };
}

function HostCtrl($rootScope, $scope, $routeParams, Host, VM, $pollingPool, Util, $location) {
  Host.get({id: $routeParams.id}, function(host){
    $scope.host = host;
    $rootScope.vms = $scope.host.virtual_machines;
    $scope.vms = $rootScope.vms;
    $scope.os_info = $scope.vms.reduce(function(ret, vm){
      if(ret[vm.os_type] != undefined){
        ret[vm.os_type] += 1;
      }else{
        ret[vm.os_type] = 1;
      }
      return ret;
    }, {});    
    
    $pollingPool.add(function(){
      var ids = $scope.vms.map(function(vm){return vm.id});
      VM.status({ids: ids}, function(data){
        Util.update($scope.vms, data);
      });
    });
  });

  
  Util.bind_tab($scope);
  
  $scope.add_bookmark = function(){
    var name="Host ";
    var subname = $scope.shortcut_name;
    if(subname && subname != "overview"){
      name += subname;
    }
    shortcut = {
      "id": "611"+$routeParams.id,
      "name": name,
      "url": $scope.location,
      "desrc": "Host快捷方式"
    };
    if(confirm("添加书签?")){
      Util.bookmark(shortcut); 
    }
  }; 
}

function HostMgmtCtrl($scope, Util){  
  $scope.selected || ($scope.selected = {});
  
  $scope.show_details = function(){
    var hosts = $.grep($scope.hosts, function(host) {
      return $scope.selected[host.id];
    });
    $scope.selected_host = hosts[0];
  };
  
  Util.pagination($scope, 'hosts', 5);
}

function HostFormCtrl($rootScope, $scope, dialog, Util, Host){
  $scope.close = function(result){
    dialog.close(result)
  };
    
  $scope.do_upsert = function(){
    if($scope.host){
      new Host($scope.host)[$scope.action](function(data){
        if(data.success){
          if($scope.action == "$save"){
            Util.update_list($rootScope.hosts, $scope.host);
          }
          Util.update_activities(data);
          dialog.close("Save Successful!");
        }
      });
    }
  };
  
  var selected_host = dialog.context_scope.selected_host;  
  if(selected_host){
    $scope.title = "编辑主机";
    $scope.action = "$update";
    $scope.host = selected_host;
  } else {
    $scope.title = "添加主机";
    $scope.action = "$save";
    $scope.host = {};    
  }  
  
  var cluster = dialog.context_scope.cluster;
  if(cluster){
    $scope.clusters = [
      {name: cluster.name, id: cluster.id}
    ];   
    $scope.host.cluster = $scope.clusters[0];  
  }else{
    $scope.clusters = [];
    angular.forEach(dialog.context_scope.clusters, function(cluster){
      $scope.clusters.push({name: cluster.name, id: cluster.id});
    });
    $scope.host.cluster = $scope.clusters[0];
  }
}

function HostActionBarCtrl($scope, $dialog, Host, Util){    
  $scope.min_msg = "你至少应该选择{0}台主机."
  $scope.max_msg = "你不能选择超过{0}台主机."
  
  var d = $dialog.dialog({
    backdrop: true,
    keyboard: true,
    backdropClick: false,
    templateUrl: "/partials/hosts/_form.html",
    controller: 'HostFormCtrl'
  });  
  
  $scope.do_add = function(){
    d.context_scope = $scope;
    d.context_scope.selected_host = null;
    d.open().then(function(result){
      if(result){
        alert('dialog closed with result: ' + result);
      }
    }); 
  };
  
  $scope.do_edit = function() {
    d.context_scope = $scope;
    Util.bind($scope, 'hosts').select(1, 1).then(function(hosts){
      d.context_scope.selected_host = hosts[0];
      d.open().then(function(result){
        if(result) {
          alert('closed: ' + result);
        }
      });
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

function VMCtrl($scope, $routeParams, VM, Util, $location) {
  $scope.selected = {};
  VM.get({id: $routeParams.id}, function(vm){
    $scope.vm = vm;
    $scope.selected[vm.id] = true;
    $scope.vms = [vm]; //Here is compatible with action_bar.
  });

  Util.bind_tab($scope);
  
  $scope.add_bookmark = function(){
    var name="VM ";
    var subname = $scope.shortcut_name;
    if(subname && subname != "overview"){
      name += subname;
    }
    shortcut = {
      "id": "6111"+$routeParams.id,
      "name": name,
      "url": $scope.location,
      "desrc": "VM快捷方式"
    };
    if(confirm("添加书签?")){
      Util.bookmark(shortcut); 
    }
  };
}

function VMMgmtCtrl($scope, Util){
  $scope.selected || ($scope.selected = {});
    
  Util.pagination($scope, 'vms', 5);
}

function VMWorkflowCtrl($rootScope, $scope, VM, dialog, Util) {  
  $scope.current_step = 1;
  $scope.steps = ["虚拟机设置", "操作系统类型", "选择计算方案", "选择存储方案", "选择网络方案", "确认创建"];
  $scope.view_types = ['vnc'];
  
  var selected_vm = dialog.context_scope.selected_vm;  
  if(selected_vm){
    $scope.action = "$update";
    $scope.vm = selected_vm;
  } else {
    $scope.action = "$save";
    $rootScope.vm = {};
    $scope.vm = {};    
  }  
  
  var cluster = dialog.context_scope.cluster;
  if(cluster){
    $scope.clusters = [
      {name: cluster.name, id: cluster.id}
    ];   
    $scope.vm.cluster = $scope.clusters[0];  
  }else{
    $scope.clusters = [];
    angular.forEach(dialog.context_scope.clusters, function(cluster){
      $scope.clusters.push({name: cluster.name, id: cluster.id});
    });
    $scope.vm.cluster = $scope.clusters[0];
  }
  
  $scope.template = {
    url: "/partials/vms/step_0" + $scope.current_step + ".html"
  };
  
  var templates = [];
  for(var i = 0; i < 6; i++){
    templates.push({name: "step0" + (i + 1), url: "/partials/vms/step_0" + (i + 1) + ".html"});
  }
  
  var change_style = function(){
    for(var i = 0; i < 6; i++){
      var j = i + 1;
      if(j < $scope.current_step){
        $scope['step0' + j + '_style'] = "btn-success";
      }else if(j > $scope.current_step){
        $scope['step0' + j + '_style'] = "";
      }else{
        $scope['step0' + j + '_style'] = "btn-info";
      }      
    }
  }
        
  var load_step = function(){
    change_style();
    $scope.template = templates[$scope.current_step - 1];
  };  
  $scope.prev_step = function(){
    $scope.current_step -= 1;
    load_step();
  };
  $scope.next_step = function(){
    $scope.current_step += 1;
    load_step();
  };
  
  $scope.do_upsert = function(){
    if($scope.vm){
      new VM($scope.vm)[$scope.action](function(data){
        if(data.success){
          if($scope.action == "$save"){
            Util.update_list($rootScope.vms, $scope.vm);
          }
          Util.update_activities(data);
          dialog.close("Save Successful!");
        }
      });
    }


    dialog.close();
  };

  $scope.close = function(result){
    dialog.close(result)
  };
  load_step();
}

function TemplateDialogCtrl($scope, dialog, VM, Util){
  $scope.title = "存为模版";
  $scope.template = {};
  $scope.close = function(result){
    dialog.close(result)
  };
  $scope.save_template = function(){
    new VM({id: dialog.context_scope.selected_vm.id, template: $scope.template}).$save_template(function(data){
      dialog.close();
      Util.update_activities(data);
    });
  };
}

function MigrateDialogCtrl($scope, dialog, VM, Util){
  $scope.title = "迁移虚拟机";
  $scope.migration = {};
  $scope.close = function(result){
    dialog.close(result)
  };

  VM.migration_hosts({id: dialog.context_scope.selected_vm.id}, function(data){
    //THIS Should return the cluster hosts for current vm exclude the same host.
    $scope.hosts = data;
    $scope.migration.host = $scope.hosts[0];
  });  
  
  
  $scope.do_migrate = function(){
    new VM({id: dialog.context_scope.selected_vm.id, migration: $scope.migration}).$migrate(function(data){
      dialog.close();
      Util.update_activities(data);
    });
  };
}


function ActionBarCtrl($scope, $q, $dialog, VM, Util){
  var d = $dialog.dialog({
    backdrop: true,
    keyboard: true,
    backdropClick: false,
    templateUrl: "vm_workflow.html",
    controller: 'VMWorkflowCtrl'
  });
  
  $scope.min_msg = "你至少应该选择{0}台虚拟机."
  $scope.max_msg = "你不能选择超过{0}台虚拟机."
  
  $scope.do_create = function(){
    d.context_scope = $scope;
    d.context_scope.selected_vm = null;
    d.open().then(function(result){
      if(result){
        alert('dialog closed with result: ' + result);
      }
    });
  };
  
  $scope.do_edit = function() {
    d.context_scope = $scope;
    Util.bind($scope, 'vms').select(1, 1).then(function(vms){
      d.context_scope.selected_vm = vms[0];
      d.open().then(function(result){
        if(result) {
          alert('' + result);
        }
      });
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
      var td = $dialog.dialog({
        backdrop: true,
        keyboard: true,
        backdropClick: false,
        templateUrl: "/partials/vms/template_dialog.html", 
        controller: "TemplateDialogCtrl"
      });
      td.context_scope = $scope;
      td.context_scope.selected_vm = vms[0];
      td.open().then(function(result){
        if(result) {
          alert('' + result);
        }
      });
    }); 
  };
  
  $scope.do_migrate = function(){
    Util.bind($scope, 'vms').select(1, 1).then(function(vms){
      var md = $dialog.dialog({
        backdrop: true,
        keyboard: true,
        backdropClick: false,
        templateUrl: "/partials/vms/migrate_dialog.html", 
        controller: "MigrateDialogCtrl"
      });
      md.context_scope = $scope;
      md.context_scope.selected_vm = vms[0];
      md.open().then(function(result){
        if(result) {
          alert('' + result);
        }
      });
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

function TemplateCtrl($scope, $routeParams, Template, Util){
  $scope.selected || ($scope.selected = {});
  $scope.selected_all = false;
  $scope.search = {os_type: 'windows'};
  
  Template.get(function(templates){
    $scope.templates = templates.templates;
    Util.pagination($scope, 'templates', 5);
    $scope.page_count = function(){
      return Math.ceil($scope.templates.filter(function(t){return t.os_type == $scope.search.os_type}).length / $scope.page_size);
    };   
    
    $scope.should_hide = function(){
      return $scope.templates.filter(function(t){return t.os_type == $scope.search.os_type}).length <= $scope.page_size;
    };
  });

  $scope.add_bookmark = function(){
    shortcut = {
      "id": "7",
      "name": "Template",
      "url": "/#/templates",
      "desc": "Template快捷方式"
    };
    if(confirm("添加书签?")){
      Util.bookmark(shortcut); 
    }
  };
}

function NetworkCtrl($scope, $routeParams, Network, Util){
  $scope.add_bookmark = function(){
    shortcut = {
      "id": "8",
      "name": "Network",
      "url": "/#/networks",
      "desc": "Network快捷方式"
    };
    if(confirm("添加书签?")){
      Util.bookmark(shortcut); 
    }
  };
}

function NetworkTypeCtrl($rootScope, $scope, $dialog, $routeParams, Network, Util){
  
  var d = $dialog.dialog({
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    templateUrl: "/partials/networks/_network_dialog.html",
    controller: 'DialogTypeCtrl'
  });

  $scope.selected || ($scope.selected = {});
  Network.get(function(networks){
    $rootScope.networks || ($rootScope.networks = networks.networks);
    $scope.networks = $rootScope.networks;
    Util.pagination($scope, 'networks', 5);
  });

  $scope.do_delete = function(){
    Util.bind($scope, 'networks').select(1, 100).confirm("你确定要移除它们吗，此操作将无法恢复!").then(function(networks){
      var network_ids = networks.map(function(network){return network.id;});
      console.log("REMOVE ALL networks " + network_ids);
      new Network({ids: network_ids}).$delete_network_all(function(data){
        if(data.success){
          angular.forEach(networks, function(network){
            var index = $scope.networks.indexOf(network);
            $scope.networks.splice(index, 1);
          });
          Util.update_activities(data);
        }
      });
    });
  };

  $scope.do_add = function(){
    d.context_scope = $scope;
    d.context_scope.selected_type = null;
    d.open().then(function(result){
      if(result){
        alert('dialog closed with result: ' + result);
      }
    });
  };

  $scope.do_edit = function(){
    d.context_scope = $scope;
    Util.bind($scope, 'networks').select(1, 1).then(function(networks){
      d.context_scope.selected_type = networks[0];
      d.open().then(function(result){
        if(result) {
          alert('dialog closed with result: ' + result);
        }
      });
    });
  };
}

function DialogTypeCtrl($rootScope, $scope, dialog, Util, Network){

  $scope.close = function(result){
    dialog.close(result);
  }

  $scope.do_upsert = function(){
    if($scope.network){
      new Network($scope.network)[$scope.action](function(data){
        if(data.success){
          if($scope.action == "$save"){
            Util.update_list($rootScope.networks, $scope.network);
          }
          Util.update_activities(data);
          dialog.close("Save Successful!");
        }
      });
    }
  };

  var selected_type = dialog.context_scope.selected_type;  
  if(selected_type){
    $scope.title = "编辑配置网络";
    $scope.action = "$update";
    $scope.network = selected_type;
  } else {
    $scope.title = "配置网络";
    $scope.action = "$save";
    $scope.network = {};   
  }
}

function NetworkPortCtrl($rootScope ,$scope, $dialog, $routeParams, Network, Util){  
  var d = $dialog.dialog({
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    templateUrl: "/partials/networks/_networkport_dialog.html",
    controller: 'DialogPortCtrl'
  });

  $scope.selected || ($scope.selected = {});  
  Network.get(function(networks){
    $rootScope.ports || ($rootScope.ports = networks.ports);
    $scope.ports = $rootScope.ports;
    Util.pagination($scope, 'ports', 5);
  });

  $scope.do_delete = function(){
    Util.bind($scope, 'ports').select(1, 100).confirm('你确定要移除它们吗，此操作将无法恢复!').then(function(ports){
      var port_ids = ports.map(function(port){return port.id;});
      console.log("REMOVE ALL networks " + port_ids);
      new Network({ids: port_ids}).$delete_port_all(function(data){
        if(data.success){
          angular.forEach(ports, function(port){
            var index = $scope.ports.indexOf(port);
            $scope.ports.splice(index, 1);
          });
          Util.update_activities(data);
        }
      });
    });
  };

  $scope.do_add = function(){
    d.context_scope = $scope;
    d.context_scope.selected_port = null;
    d.open().then(function(result){
      if(result){
        alert('dialog closed with result: ' + result);
      }
    });
  };

  $scope.do_edit = function(){
    d.context_scope = $scope;
    Util.bind($scope, 'ports').select(1, 1).then(function(ports){
      d.context_scope.selected_port = ports[0]
      d.open().then(function(result){
        if(result) {
          alert('dialog closed with result: ' + result);
        }
      });
    });
  };
}

function DialogPortCtrl($rootScope ,$scope, dialog, Util, Network){
  $scope.close = function(result){
    dialog.close(result);
  }

  $scope.do_upsert = function(){
    var network = $scope.network
    if(network){
      new Network($scope.network)[$scope.action](function(data){
        if(data.success){
          if($scope.action == "$save"){
            Util.update_list($rootScope.ports, network);  
          }
          Util.update_activities(data);
          dialog.close("Save Successful!");
        }
      });
    }
  };

  var selected_port = dialog.context_scope.selected_port;
  $scope.data_directions = [{"key":"in"},{"key":"out"},{"key":"inout"}];  
  if(selected_port){
    $scope.title = "编辑配置网络";
    $scope.action = "$update";
    $scope.network = selected_port;
    $scope.network.data_direction = $scope.data_directions[0];
  } else {
    $scope.title = "配置网络";
    $scope.action = "$save";
    $scope.network = {};
    $scope.network.data_direction = $scope.data_directions[0];    
  }
}

function ArchitectCtrl($scope, Util){
  $scope.add_bookmark = function(){
    shortcut = {
      "id": "9",
      "name": "Architect",
      "url": "/#/architects",
      "desc": "Network快捷方式"
    };
    if(confirm("添加书签?")){
      Util.bookmark(shortcut); 
    }
  };
}

function StorageCtrl($rootScope, $scope, $dialog, $routeParams, Storage, Util){
  
  var d = $dialog.dialog({
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    templateUrl: "/partials/storages/_storage_dialog.html",
    controller: 'DialogStorageCtrl'
  });

  $scope.selected || ($scope.selected = {});
  
  Storage.get(function(storages){
    $rootScope.storages = storages.storages;
    $scope.storages = $rootScope.storages;
    $scope.storage_obj = storages;
    Util.pagination($scope, 'storages', 5);
  });

  $scope.do_delete = function(){
    Util.bind($scope, 'storages').select(1, 100).confirm('你确定要移除它们吗，此操作将无法恢复!').then(function(storages){
      var storage_ids = storages.map(function(storage){return storage.id;});
      console.log("REMOVE ALL storages " + storage_ids);
      new Storage({ids: storage_ids}).$delete_all(function(data){
        if(data.success){
          angular.forEach(storages, function(storage){
            var index = $scope.storages.indexOf(storage);
            $scope.storages.splice(index, 1);
          });
          Util.update_activities(data);
        }
      });
    });
  }

  $scope.do_add = function(){
    d.context_scope = $scope;
    d.context_scope.selected_storage = null;
    d.open().then(function(result){
      if(result){
        alert('dialog closed with result: ' + result);
      }
    });
  };

  $scope.do_edit = function(){
    d.context_scope = $scope;
    Util.bind($scope, 'storages').select(1, 1).then(function(storages){
      d.context_scope.selected_storage = storages[0];
      d.open().then(function(result){
        if(result) {
          alert('dialog closed with result: ' + result);
        }
      });
    });
  };
}

function DialogStorageCtrl($rootScope, $scope, dialog, Util, Storage){
  $scope.close = function(result){
    dialog.close(result);
  }

  $scope.do_upsert = function(){
    if($scope.storage){
      new Storage($scope.storage)[$scope.action](function(data){
        if(data.success){
          if($scope.action == "$save"){
            Util.update_list($rootScope.storages, $scope.storage);
          }
          Util.update_activities(data);
          dialog.close("Save Successful!");
        }
      });
    }
  };

  var selected_storage = dialog.context_scope.selected_storage;  
  if(selected_storage){
    $scope.title = "编辑存储配置";
    $scope.action = "$update";
    $scope.storage = selected_storage;
  } else {
    $scope.title = "配置存储";
    $scope.action = "$save";
    $scope.storage = {};   
  }
}

function ShortcutCtrl($scope, $rootScope, Shortcut, Util){
  $rootScope.selected || ($rootScope.selected = {});
  $scope.do_delete = function(){
    Util.bind($rootScope, 'shortcuts').select(1, 100).confirm('你确定要移除它们吗，此操作将无法恢复!').then(function(shortcuts){
      var shortcut_ids = shortcuts.map(function(shortcut){return shortcut.id;});
      console.log("REMOVE ALL storages " + shortcut_ids);
      new Shortcut({ids: shortcut_ids}).$delete_all(function(data){
        if(data.success){
          angular.forEach(shortcuts, function(shortcut){
            var index = $rootScope.shortcuts.indexOf(shortcut);
            $rootScope.shortcuts.splice(index, 1);
          });
          Util.update_activities(data);
        }
      });
    });
  }
}

function ProjectCtrl($scope, $routeParams, Project, Util){
  Util.bind_tab($scope);
  
  $scope.add_bookmark = function(){
    var name="Project ";
    var subname = $scope.shortcut_name;
    if(subname && subname != "overview"){
      name += subname;
    }
    shortcut = {
      "id": "10"+$routeParams.id,
      "name": name,
      "url": $scope.location,
      "desrc": "Project快捷方式"
    };
    if(confirm("添加书签?")){
      Util.bookmark(shortcut); 
    }
  };
}

function ComputeProjectCtrl($scope, $dialog, $routeParams, Project, Util){
  
  var d = $dialog.dialog({
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    templateUrl: "/partials/projects/_compute_dialog.html",
    controller: 'DialogCompute'
  });

  $scope.selected || ($scope.selected = {});

  Project.get(function(projects){
    $scope.computes = projects.computes;
    Util.pagination($scope, 'computes', 5);
  });

  $scope.do_delete = function(){
    Util.bind($scope, 'computes').select(1, 100).confirm('你确定要移除它们吗，此操作将无法恢复!').then(function(computes){
      var compute_ids = computes.map(function(compute){return compute.id;});
      console.log("REMOVE ALL storages " + compute_ids);
      new Project({ids: compute_ids}).$delete_all(function(data){
        if(data.success){
          angular.forEach(computes, function(compute){
            var index = $scope.computes.indexOf(compute);
            $scope.computes.splice(index, 1);
          });
          Util.update_activities(data);
        }
      });
    });
  }

  $scope.do_edit = function(){
    d.context_scope = $scope;
    Util.bind($scope, 'computes').select(1, 1).then(function(computes){
      d.context_scope.selected_compute = computes[0];
      d.open().then(function(result){
        if(result) {
          alert('dialog closed with result: ' + result);
        }
      });
    });
  };
}

function DialogCompute($scope, dialog, Util, Project){
  $scope.close = function(result){
    dialog.close(result);
  }

  $scope.do_upsert = function(){
    if($scope.compute){
      new Project($scope.compute)[$scope.action](function(data){
        if(data.success){
          Util.update_activities(data);
          dialog.close("Save Successful!");
        }
      });
    }
  };

  var selected_compute = dialog.context_scope.selected_compute;  
  if(selected_compute){
    $scope.title = "修改计算方案";
    $scope.action = "$update";
    $scope.compute = selected_compute;
  }
}

function StorageProjectCtrl($scope, $dialog, $routeParams, Project, Util){
  
  var d = $dialog.dialog({
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    templateUrl: "/partials/projects/_storage_dialog.html",
    controller: 'DialogStorage'
  });

  $scope.selected || ($scope.selected = {});

  Project.get(function(projects){
    $scope.storages = projects.storages;
    Util.pagination($scope, 'storages', 5);
  });

  $scope.do_delete = function(){
    Util.bind($scope, 'storages').select(1, 100).confirm('你确定要移除它们吗，此操作将无法恢复!').then(function(storages){
      var storage_ids = storages.map(function(storage){return storage.id;});
      console.log("REMOVE ALL storages " + storage_ids);
      new Project({ids: storage_ids}).$delete_all(function(data){
        if(data.success){
          angular.forEach(storages, function(storage){
            var index = $scope.storages.indexOf(storage);
            $scope.storages.splice(index, 1);
          });
          Util.update_activities(data);
        }
      });
    });
  }

  $scope.do_edit = function(){
    d.context_scope = $scope;
    Util.bind($scope, 'storages').select(1, 1).then(function(storages){
      d.context_scope.selected_storage = storages[0];
      d.open().then(function(result){
        if(result) {
          alert('dialog closed with result: ' + result);
        }
      });
    });
  };
}

function DialogStorage($scope, dialog, Util, Project){
  $scope.close = function(result){
    dialog.close(result);
  }

  $scope.do_upsert = function(){
    if($scope.storage){
      new Project($scope.storage)[$scope.action](function(data){
        if(data.success){
          Util.update_activities(data);
          dialog.close("Save Successful!");
        }
      });
    }
  };

  var selected_storage = dialog.context_scope.selected_storage;  
  if(selected_storage){
    $scope.title = "修改存储方案";
    $scope.action = "$update";
    $scope.storage = selected_storage;
  }
}

function NetworkProjectCtrl($scope, $dialog, $routeParams, Project, Util){
  
  var d = $dialog.dialog({
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    templateUrl: "/partials/projects/_network_dialog.html",
    controller: 'DialogNetwork'
  });

  $scope.selected || ($scope.selected = {});

  Project.get(function(projects){
    $scope.networks = projects.networks;
    Util.pagination($scope, 'networks', 5);
  });

  $scope.do_delete = function(){
    Util.bind($scope, 'networks').select(1, 100).confirm('你确定要移除它们吗，此操作将无法恢复!').then(function(networks){
      var network_ids = networks.map(function(network){return network.id;});
      console.log("REMOVE ALL storages " + network_ids);
      new Project({ids: network_ids}).$delete_all(function(data){
        if(data.success){
          angular.forEach(networks, function(network){
            var index = $scope.networks.indexOf(network);
            $scope.networks.splice(index, 1);
          });
          Util.update_activities(data);
        }
      });
    });
  }

  $scope.do_edit = function(){
    d.context_scope = $scope;
    Util.bind($scope, 'networks').select(1, 1).then(function(networks){
      d.context_scope.selected_network = networks[0];
      d.open().then(function(result){
        if(result) {
          alert('dialog closed with result: ' + result);
        }
      });
    });
  };
}

function DialogNetwork($scope, dialog, Util, Project){
  $scope.close = function(result){
    dialog.close(result);
  }

  $scope.do_upsert = function(){
    if($scope.network){
      new Project($scope.network)[$scope.action](function(data){
        if(data.success){
          Util.update_activities(data);
          dialog.close("Save Successful!");
        }
      });
    }
  };

  var selected_network = dialog.context_scope.selected_network;  
  if(selected_network){
    $scope.title = "修改存储方案";
    $scope.action = "$update";
    $scope.network = selected_network;
  }
}

function BackupStrategyCtrl($rootScope, $scope, $dialog, $routeParams, BackupStrategy, Util) {
  
  var d = $dialog.dialog({
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    templateUrl: "/partials/backupstrategys/_backupstrategy_dialog.html",
    controller: 'DialogBackupStrategyCtrl'
  });

  $scope.selected || ($scope.selected = {});
  
  BackupStrategy.get(function(backupstrategys){
    $rootScope.backupstrategys = backupstrategys.strategys; 
    $scope.backupstrategys = $rootScope.backupstrategys;
    Util.pagination($scope, 'backupstrategys', 5);
  });

  $scope.do_delete = function(){
    Util.bind($scope, 'backupstrategys').select(1, 100).confirm('你确定要移除它们吗，此操作将无法恢复!').then(function(backupstrategys){
      var backupstrategy_ids = backupstrategys.map(function(backupstrategy){return backupstrategy.id;});
      console.log("REMOVE ALL storages " + backupstrategy_ids);
      new BackupStrategy({ids: backupstrategy_ids}).$delete_all(function(data){
        if(data.success){
          angular.forEach(backupstrategys, function(backupstrategy){
            var index = $scope.backupstrategys.indexOf(backupstrategy);
            $scope.backupstrategys.splice(index, 1);
          });
          Util.update_activities(data);
        }
      });
    });
  }

  $scope.do_add = function(){
    d.context_scope = $scope;
    d.context_scope.selected_backupstrategy = null;
    d.open().then(function(result){
      if(result){
        alert('dialog closed with result: ' + result);
      }
    });
  };

  $scope.do_edit = function(){
    d.context_scope = $scope;
    Util.bind($scope, 'backupstrategys').select(1, 1).then(function(backupstrategys){
      d.context_scope.selected_backupstrategy = backupstrategys[0];
      d.open().then(function(result){
        if(result) {
          alert('dialog closed with result: ' + result);
        }
      });
    });
  };

  Util.bind_tab($scope);
  
  $scope.add_bookmark = function(){
    var name="BackupStrategy ";
    var subname = $scope.shortcut_name;
    if(subname && subname != "overview"){
      name += subname;
    }
    shortcut = {
      "id": "11",
      "name": name,
      "url": $scope.location,
      "desrc": "BackupStrategy快捷方式"
    };
    if(confirm("添加书签?")){
      Util.bookmark(shortcut); 
    }
  };
}

function DialogBackupStrategyCtrl($rootScope, $scope, dialog, Util, BackupStrategy){
  $scope.close = function(result){
    dialog.close(result);
  }

  $scope.do_upsert = function(){
    if($scope.backupstrategy){
      new BackupStrategy($scope.backupstrategy)[$scope.action](function(data){
        if(data.success){
          if($scope.action == "$save"){
            Util.update_list($rootScope.backupstrategys, $scope.backupstrategy);
          }
          Util.update_activities(data);
          dialog.close("Save Successful!");
        }
      });
    }
  };

  var selected_backupstrategy = dialog.context_scope.selected_backupstrategy;  
  if(selected_backupstrategy){
    $scope.title = "配置策略";
    $scope.action = "$update";
    $scope.backupstrategy = selected_backupstrategy;
  } else {
    $scope.title = "新建策略";
    $scope.action = "$save";
    $scope.backupstrategy = {};   
  }

  $scope.backupTypes = [
    {name:'冷备份'},
    {name:'热备份'}
  ];
  $scope.backupstrategy.type = $scope.backupTypes[0];

  $scope.schedules = [
    {name: "每小时"},
    {name: "每天"},
    {name: "每周"},
    {name: "每月"},
    {name: "每年"}
  ];
  $scope.backupstrategy.schedule = $scope.schedules[0];
}
