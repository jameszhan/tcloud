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

function ActivityCtrl($rootScope, Activity){
  Activity.query({}, function(data){    
    $rootScope.activities = data;
  });
}

function DataCenterEventCtrl($scope, $routeParams, DataCenterEvent){
  DataCenterEvent.query({data_center_id: $routeParams.id}, function(events, headersFn){
    $scope.events = events;
  });
}

function DataCenterCtrl($scope, $routeParams, DataCenter, Host, VM, $pollingPool, Util) {
  DataCenter.get({id: $routeParams.id}, function(datacenter){
    $scope.datacenter = datacenter;
    $scope.clusters = $scope.datacenter.clusters;
    $scope.hosts = Util.flatten($scope.clusters, 'hosts');
    $scope.vms = Util.flatten($scope.hosts, 'virtual_machines');
    
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
}

function ClusterCtrl($scope, $routeParams, $dialog, Cluster, currentCluster, Host, VM, $pollingPool, Util) {
  Cluster.get({id: $routeParams.id}, function(cluster){
    $scope.cluster = cluster;
    currentCluster.set(cluster);
    $scope.hosts = cluster.hosts;
    $scope.vmSetupModal = true;
    $scope.vms = Util.flatten($scope.hosts, 'virtual_machines');
    
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
}

function HostCtrl($scope, $routeParams, Host, VM, $pollingPool, Util) {
  Host.get({id: $routeParams.id}, function(host){
    $scope.host = host;
    $scope.vms = $scope.host.virtual_machines;
    
    $pollingPool.add(function(){
      var ids = $scope.vms.map(function(vm){return vm.id});
      VM.status({ids: ids}, function(data){
        Util.update($scope.vms, data);
      });
    });
  });
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

function HostFormCtrl($scope, dialog, Util, Host){
  $scope.close = function(result){
    dialog.close(result)
  };
    
  $scope.do_upsert = function(){
    if($scope.host){
      new Host($scope.host)[$scope.action](function(data){
        if(data.success){
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
  var do_check = function(min, max){
    var hosts = $.grep($scope.hosts, function(host) {
      return $scope.selected[host.id];
    }), ok = true;
    if(hosts.length < min){
      alert("你至少应该选择" + min + "台虚拟机.");
      ok = false;
    }
    if(hosts.length > max){
      alert("你不能选择超过" + max + "台虚拟机.");
      ok = false;
    }
    return {
      then: function(fn){ ok && (fn || angular.noop)(hosts); }
    };
  };    
  
  var d = $dialog.dialog({
    backdrop: true,
    keyboard: true,
    backdropClick: false,
    templateUrl: "/partials/hosts/_form.html",
    controller: 'HostFormCtrl'
  });
  
  $scope.do_add = function(){
    d.context_scope = $scope;
    d.open().then(function(result){
      if(result){
        alert('dialog closed with result: ' + result);
      }
    }); 
  };
  
  $scope.do_edit = function() {
    d.context_scope = $scope;
    do_check(1, 1).then(function(hosts){
      d.context_scope.selected_host = hosts[0];
      d.open().then(function(result){
        if(result) {
          alert('closed: ' + result);
        }
      });
    });
  };
  
  $scope.do_remove = function(){
    do_check(1, 100).then(function(hosts){
      if(window.confirm("你确定要移除它们吗，此操作将无法恢复!")){
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
      }
    }); 
  };

  $scope.do_maintain = function(){
    do_check(1, 100).then(function(hosts){
      if(window.confirm("确定要进行维护操作？")){
        var host_ids = hosts.map(function(host){ return host.id; });
        console.log("Maintain the hosts " + host_ids);
        new Host({ids: host_ids}).$maintain(Util.update_activities);
      }
    }); 
  };
  
  $scope.do_activate = function(){
    do_check(1, 100).then(function(hosts){
      if(window.confirm("确定要进行激活操作？")){
        var host_ids = hosts.map(function(host){ return host.id; });
        console.log("Activate the hosts " + host_ids);
        new Host({ids: host_ids}).$activate(Util.update_activities);
      }
    });
  };  

  $scope.do_start = function(){
    do_check(1, 100).then(function(hosts){
      if(window.confirm("确定要进行启动操作？")){
        var host_ids = hosts.map(function(host){ return host.id; });
        console.log("Start the hosts " + host_ids);
        new Host({ids: host_ids}).$start(Util.update_activities);
      }
    });
  };
  
  $scope.do_shutdown = function(){
    do_check(1, 100).then(function(hosts){
      if(window.confirm("确定要进行关机操作？")){
        var host_ids = hosts.map(function(host){ return host.id; });
        console.log("Shutdown the hosts " + host_ids);
        new Host({ids: host_ids}).$shutdown(Util.update_activities);
      }
    });
  };
  
  $scope.do_reboot = function(){
    do_check(1, 100).then(function(hosts){
      if(window.confirm("确定要进行重启操作？")){
        var host_ids = hosts.map(function(host){ return host.id; });
        console.log("Reboot the hosts " + host_ids);
        new Host({ids: host_ids}).$reboot(Util.update_activities);
      }
    });
  };
  
}

function VMCtrl($scope, $routeParams, VM) {
  $scope.selected = {};
  VM.get({id: $routeParams.id}, function(vm){
    $scope.vm = vm;
    $scope.selected[vm.id] = true;
    $scope.vms = [vm]; //Here is compatible with action_bar.
  });
}

function VMMgmtCtrl($scope, Util){
  $scope.selected || ($scope.selected = {});
    
  Util.pagination($scope, 'vms', 5);
}

function VMWorkflowCtrl($scope, dialog, currentCluster, selectedVM) {
  $scope.cluster = currentCluster.get();
  
  $scope.current_step = 1;
  $scope.steps = ["虚拟机设置", "操作系统类型", "选择计算方案", "选择存储方案", "选择网络方案", "确认创建"];
  $scope.view_types = ['vnc'];
  
  var selected_vm = selectedVM.get();
  if(selected_vm){
    console.log("Edit VM.");
    $scope.vm = selected_vm;
  } else {
    console.log("Add VM.");
    $scope.vm = {
      cluster_id: currentCluster.id,
      view_type: 'vnc',
      usb_redirect: true,
      startup_with_host: true
    };    
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
  $scope.create = function(){
    console.log($scope.vm);
  };  
  $scope.close = function(result){
    dialog.close(result)
  };
  load_step();
}

function ActionBarCtrl($scope, $q, $dialog, VM, selectedVM, Util){
  var d = $dialog.dialog({
    backdrop: true,
    keyboard: true,
    backdropClick: false,
    templateUrl: "vm_workflow.html",
    controller: 'VMWorkflowCtrl'
  });
  
  var do_check = function(min, max){
    var vms = $.grep($scope.vms, function(vm) {
      return $scope.selected[vm.id];
    }), ok = true;
    if(vms.length < min){
      alert("你至少应该选择" + min + "台虚拟机.");
      ok = false;
    }
    if(vms.length > max){
      alert("你不能选择超过" + max + "台虚拟机.");
      ok = false;
    }
    return {
      then: function(fn){ ok && (fn || angular.noop)(vms); }
    };
  };
  
  $scope.do_create = function(){
    selectedVM.set(null);
    d.open().then(function(result){
      if(result){
        alert('dialog closed with result: ' + result);
      }
    });
  };
  
  $scope.do_edit = function() {
    do_check(1, 1).then(function(vms){
      selectedVM.set(vms[0]);
      d.open().then(function(result){
        if(result) {
          alert('' + result);
        }
      });
    });
  };
  
  $scope.do_delete = function(){
    do_check(1, 100).then(function(vms){
      if(window.confirm("你确定要删除它们吗，此操作将无法恢复!")){
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
      }
    }); 
  };

  $scope.do_template = function(){
    do_check(1, 100).then(function(vms){
      if(window.confirm("确定要存为模版？")){
        var vm_ids = vms.map(function(vm){ return vm.id; });
        console.log("Save Template for VMS " + vm_ids);
        new VM({ids: vm_ids}).$save_template(Util.update_activities);
      }
    }); 
  };
  
  $scope.do_migrate = function(){
    do_check(1, 100).then(function(vms){
      if(window.confirm("你确定要迁移它(们)吗？")){
        var vm_ids = vms.map(function(vm){ return vm.id; });        
        console.log("Migration for VMS " + vm_ids);
        new VM({ids: vm_ids}).$migrate(Util.update_activities);
      }
    }); 
  };
  
  $scope.do_suspend = function(){
    do_check(1, 100).then(function(vms){
      if(window.confirm("你确定要暂停它(们)吗!")){
        var vm_ids = vms.map(function(vm){ return vm.id; });
        console.log("Suspend VMS " + vm_ids);
        new VM({ids: vm_ids}).$suspend(Util.update_activities);
      }
    }); 
  };
  
  $scope.do_start = function(){
    do_check(1, 100).then(function(vms){
      if(window.confirm("你确定要启动它(们)吗？")){
        var vm_ids = vms.map(function(vm){ return vm.id; });
        console.log("Start VMS " + vm_ids);
        new VM({ids: vm_ids}).$start(Util.update_activities);
      }
    }); 
  };
  
  $scope.do_reboot = function(){
    do_check(1, 100).then(function(vms){
      if(window.confirm("你确定要删要重启它(们)吗？")){
        var vm_ids = vms.map(function(vm){return vm.id});
        console.log("Restart VMS " + vm_ids);
        new VM({ids: vm_ids}).$reboot(Util.update_activities);
      }
    }); 
  };
  
  $scope.do_shutdown = function(){
    do_check(1, 100).then(function(vms){
      if(window.confirm("你确定要关闭它(们)吗")){
        var vm_ids = vms.map(function(vm){return vm.id});
        console.log("Shutdown VMS " + vm_ids);
        new VM({ids: vm_ids}).$shutdown(Util.update_activities);
      }
    }); 
  };
  
  $scope.do_snapshot = function(){
    do_check(1, 100).then(function(vms){
      if(window.confirm("确定要创建快照吗？")){
        var vm_ids = vms.map(function(vm){return vm.id});
        console.log("Snapshot VMS " + vm_ids);
        new VM({ids: vm_ids}).$snapshot(Util.update_activities);
      }
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
}

function NetworkCtrl($scope, $routeParams, Network, Util){

}

function NetworkTypeCtrl($scope, $dialog, $routeParams, Network, Util){
  
  var d = $dialog.dialog({
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    templateUrl: "network_new.html",
    controller: 'DialogTypeCtrl'
  });

  $scope.selected || ($scope.selected = {});
  Network.get(function(networks){
    $scope.networks = networks.networks;
    Util.pagination($scope, 'networks', 5);
  });
  
  var do_check = function(min, max){
    var networks = $.grep($scope.networks, function(network) {
      return $scope.selected[network.id];
    }), ok = true;
    if(networks.length < min){
      alert("你至少应该选择" + min + "台虚拟机.");
      ok = false;
    }
    if(networks.length > max){
      alert("你不能选择超过" + max + "台虚拟机.");
      ok = false;
    }
    return {
      then: function(fn){ ok && (fn || angular.noop)(networks); }
    };
  };

  $scope.do_delete = function(){
    do_check(1, 100).then(function(networks){
      if(window.confirm("你确定要移除它们吗，此操作将无法恢复!")){
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
      }
    });
  };

  $scope.do_create = function(){
    d.open().then(function(result){
      if(result){
        alert('dialog closed with result: ' + result);
      }
    });
  };

  $scope.do_edit = function(){
    do_check(1, 1).then(function(networks){
      d.open().then(function(result){
        if(result) {
          alert('dialog closed with result: ' + result);
        }
      });
    });
  };
}

function DialogTypeCtrl($scope, dialog){
  
  $scope.template = {
    url: "/partials/networks/_network_new.html"
  };

  $scope.close = function(result){
    dialog.close(result);
  }
}

function NetworkPortCtrl($scope, $dialog, $routeParams, Network, Util){
  
  var d = $dialog.dialog({
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    templateUrl: "network_new.html",
    controller: 'DialogPortCtrl'
  });

  $scope.selected || ($scope.selected = {});  
  Network.get(function(networks){
    $scope.ports = networks.ports;
    Util.pagination($scope, 'ports', 5);
  });

  var do_check = function(min, max){
    var ports = $.grep($scope.ports, function(port) {
      return $scope.selected[port.id];
    }), ok = true;
    if(ports.length < min){
      alert("你至少应该选择" + min + "台虚拟机.");
      ok = false;
    }
    if(ports.length > max){
      alert("你不能选择超过" + max + "台虚拟机.");
      ok = false;
    }
    return {
      then: function(fn){ ok && (fn || angular.noop)(ports); }
    };
  };

  $scope.do_delete = function(){
    do_check(1, 100).then(function(ports){
      if(window.confirm("你确定要移除它们吗，此操作将无法恢复!")){
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
      }
    });
  }

  $scope.do_create = function(){
    d.open().then(function(result){
      if(result){
        alert('dialog closed with result: ' + result);
      }
    });
  };

  $scope.do_edit = function(){
    do_check(1, 1).then(function(networks){
      d.open().then(function(result){
        if(result) {
          alert('dialog closed with result: ' + result);
        }
      });
    });
  };

}

function DialogPortCtrl($scope, dialog){
  
  $scope.template = {
    url: "/partials/networks/_networkport_new.html"
  };

  $scope.close = function(result){
    dialog.close(result);
  }
}

function ArchitectCtrl($scope){
}

function StorageCtrl($scope, $dialog, $routeParams, Storage, Util){
  
  var d = $dialog.dialog({
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    templateUrl: "storage_new.html",
    controller: 'DialogCtrl'
  });

  $scope.selected || ($scope.selected = {});
  
  Storage.get(function(storages){
    $scope.storages = storages.storages;
    Util.pagination($scope, 'storages', 5);
  });

  var do_check = function(min, max){
    var storages = $.grep($scope.storages, function(storage) {
      return $scope.selected[storage.id];
    }), ok = true;
    if(storages.length < min){
      alert("你至少应该选择" + min + "台虚拟机.");
      ok = false;
    }
    if(storages.length > max){
      alert("你不能选择超过" + max + "台虚拟机.");
      ok = false;
    }
    return {
      then: function(fn){ ok && (fn || angular.noop)(storages); }
    };
  };

  $scope.do_delete = function(){
    do_check(1, 100).then(function(storages){
      if(window.confirm("你确定要移除它们吗，此操作将无法恢复!")){
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
      }
    });
  }

  $scope.do_create = function(){
    d.open().then(function(result){
      if(result){
        alert('dialog closed with result: ' + result);
      }
    });
  };

  $scope.do_edit = function(){
    do_check(1, 1).then(function(storages){
      d.open().then(function(result){
        if(result) {
          alert('dialog closed with result: ' + result);
        }
      });
    });
  };
}

function ShortCutCtrl($scope, $routeParams, ShortCut, Util){
  $scope.selected || ($scope.selected = {});
  
  ShortCut.get(function(shortcuts){
    $scope.shortcuts = shortcuts.shortcuts;
    Util.pagination($scope, 'shortcuts', 5);
  });
}
