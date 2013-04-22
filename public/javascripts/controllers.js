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

function ClusterCtrl($scope, $routeParams, $dialog, $templateCache, Cluster, currentCluster) {
  Cluster.get({id: $routeParams.id}, function(cluster){
    $scope.cluster = cluster;
    currentCluster.set(cluster);
    $scope.hosts = cluster.hosts;
    $scope.vmSetupModal = true;
    $scope.vms = flatten($scope.hosts, 'virtual_machines');
  });
}


function HostCtrl($scope, $http) {

}



function VMCtrl($scope, $http) {

}

function VMMgmtCtrl($scope, $http, $templateCache, $dialog){
  for(var i = 0; i < 6; i++){
    $http.get("/partials/vms/step_0" + (i + 1) + ".html", {cache:$templateCache});
  }  
  
  $scope.open_dialog = function(){
    var d = $dialog.dialog({
      backdrop: true,
      keyboard: true,
      backdropClick: true,
      templateUrl: "vm_workflow.html",
      controller: 'VMWorkflowCtrl'
    });
    d.open().then(function(result){
      if(result){
        alert('dialog closed with result: ' + result);
      }
    });
  }  
}

function VMWorkflowCtrl($scope, $templateCache, dialog, currentCluster) {
  $scope.cluster = currentCluster.get();
  
  $scope.current_step = 1;
  $scope.steps = ["虚拟机设置", "操作系统类型", "选择计算方案", "选择存储方案", "选择网络方案", "确认创建"];
  $scope.view_types = ['vnc'];
  
  $scope.vm = {
    cluster_id: currentCluster.id,
    view_type: 'vnc',
    usb_redirect: true,
    startup_with_host: true
  };
  
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
