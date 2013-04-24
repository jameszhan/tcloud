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

function DataCenterCtrl($scope, $routeParams, DataCenter) {
  DataCenter.get({id: $routeParams.id}, function(datacenter){
    $scope.datacenter = datacenter;
    $scope.hosts = flatten($scope.datacenter.clusters, 'hosts');
    $scope.vms = flatten($scope.hosts, 'virtual_machines');
  });  
}

function DataCenterEventCtrl($scope, $routeParams, DataCenterEvent){
  DataCenterEvent.query({data_center_id: $routeParams.id}, function(events, headersFn){
    $scope.events = events;
  });
}

function ClusterCtrl($scope, $routeParams, $dialog, Cluster, currentCluster) {
  Cluster.get({id: $routeParams.id}, function(cluster){
    $scope.cluster = cluster;
    currentCluster.set(cluster);
    $scope.hosts = cluster.hosts;
    $scope.vmSetupModal = true;
    $scope.vms = flatten($scope.hosts, 'virtual_machines');
  });
}


function HostCtrl($scope, $routeParams, Host) {
  Host.get({id: $routeParams.id}, function(host){
    $scope.host = host;
    $scope.vms = $scope.host.virtual_machines;
  });
}

function VMCtrl($scope, $routeParams, VM) {
  VM.get({id: $routeParams.id}, function(vm){
    $scope.vm = vm;
  });
}

function VMMgmtCtrl($scope){
  $scope.selected = {};
}

function VMWorkflowCtrl($scope, dialog, currentCluster, selectedVM) {
  $scope.cluster = currentCluster.get();
  
  $scope.current_step = 1;
  $scope.steps = ["虚拟机设置", "操作系统类型", "选择计算方案", "选择存储方案", "选择网络方案", "确认创建"];
  $scope.view_types = ['vnc'];
  
  selected_vm = selectedVM.get();
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

function ActionBarCtrl($scope, $q, $dialog, VMService, selectedVM){
  var d = $dialog.dialog({
    backdrop: true,
    keyboard: true,
    backdropClick: true,
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
          alert('dialog closed with result: ' + result);
        }
      });
    });
  };
  
  $scope.do_delete = function(){
    do_check(1, 100).then(function(vms){
      if(window.confirm("你确定要删除它们吗，此操作将无法恢复!")){
        var vm_ids = vms.map(function(vm){return vm.id;});
        console.log("DELETE ALL VMS " + vm_ids);
        new VMService({ids: vm_ids}).$delete_all(function(data){
          if(data.success){
            angular.forEach(vms, function(vm){
              var index = $scope.vms.indexOf(vm);
              $scope.vms.splice(index, 1);
            });
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
        new VMService({ids: vm_ids}).$save_template();
      }
    }); 
  };
  
  $scope.do_migrate = function(){
    do_check(1, 100).then(function(vms){
      if(window.confirm("你确定要迁移它(们)吗？")){
        var vm_ids = vms.map(function(vm){ return vm.id; });        
        console.log("Migration for VMS " + vm_ids);
        new VMService({ids: vm_ids}).$migrate();
      }
    }); 
  };
  
  $scope.do_suspend = function(){
    do_check(1, 100).then(function(vms){
      if(window.confirm("你确定要暂停它(们)吗!")){
        var vm_ids = vms.map(function(vm){ return vm.id; });
        console.log("Suspend VMS " + vm_ids);
        new VMService({ids: vm_ids}).$suspend();
      }
    }); 
  };
  
  $scope.do_start = function(){
    do_check(1, 100).then(function(vms){
      if(window.confirm("你确定要启动它(们)吗？")){
        var vm_ids = vms.map(function(vm){ return vm.id; });
        console.log("Start VMS " + vm_ids);
        new VMService({ids: vm_ids}).$start();
      }
    }); 
  };
  
  $scope.do_reboot = function(){
    do_check(1, 100).then(function(vms){
      if(window.confirm("你确定要删要重启它(们)吗？")){
        var vm_ids = vms.map(function(vm){return vm.id});
        console.log("Restart VMS " + vm_ids);
        new VMService({ids: vm_ids}).$reboot();
      }
    }); 
  };
  
  $scope.do_shutdown = function(){
    do_check(1, 100).then(function(vms){
      if(window.confirm("你确定要关闭它(们)吗")){
        var vm_ids = vms.map(function(vm){return vm.id});
        console.log("Shutdown VMS " + vm_ids);
        new VMService({ids: vm_ids}).$shutdown();
      }
    }); 
  };
  
  $scope.do_snapshot = function(){
    do_check(1, 100).then(function(vms){
      if(window.confirm("确定要创建快照吗？")){
        var vm_ids = vms.map(function(vm){return vm.id});
        console.log("Snapshot VMS " + vm_ids);
        new VMService({ids: vm_ids}).$snapshot();
      }
    }); 
  };

}
