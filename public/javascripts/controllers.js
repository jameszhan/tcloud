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
  
  
  /*
  $http.get('/datacenters/' + $routeParams.id).success(function(data) {
    $scope.datacenter = data;
    $scope.hosts = flatten(data.clusters, 'hosts');
    $scope.vms = flatten($scope.hosts, 'virtual_machines');
  });
  */  
}

function DataCenterEventCtrl($scope, $routeParams, DataCenterEvent){
  DataCenterEvent.query({data_center_id: $routeParams.id}, function(events, headersFn){
    $scope.events = events;
  })
  /*
  $http.get('/datacenters/' + $routeParams.id + "/events").success(function(data){
    $scope.events = data;
  });
  */
}

function ClusterCtrl($scope, $http, $routeParams, $dialog, $templateCache, currentCluster) {
  for(var i = 0; i < 6; i++){
    $http.get("/partials/vms/step_0" + (i + 1) + ".html", {cache:$templateCache})
  }  

  $http.get('/clusters/' + $routeParams.id).success(function(data) {
    $scope.cluster = data;
    currentCluster.set($scope.cluster);
    $scope.hosts = data.hosts;
    $scope.vmSetupModal = true;
    $scope.vms = flatten($scope.hosts, 'virtual_machines');
  });
  
  $scope.opts = {
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    templateUrl: "vm_workflow.html",
    controller: 'VMWorkflowCtrl'
  };
  $scope.open_dialog = function(){
    var d = $dialog.dialog($scope.opts);
    d.open().then(function(result){
      if(result){
        alert('dialog closed with result: ' + result);
      }
    });
  }
}


function HostCtrl($scope, $http) {

}



function VMCtrl($scope, $http) {

}

function VMWorkflowCtrl($scope, $http, $templateCache, dialog, currentCluster) {
  $scope.cluster = currentCluster.get();
  $scope.current_step = 1;
  $scope.step01_style = "btn-success";
  $scope.steps = ["虚拟机设置", "操作系统类型", "选择计算方案", "选择存储方案", "选择网络方案", "确认创建"];
  
  $scope.load_step = function(){
    dialog.modalEl.find('.modal-body').html($templateCache.get("/partials/vms/step_0" + $scope.current_step + ".html")[1]);
  };  
  $scope.prev_step = function(){
    $scope.current_step -= 1;
    $scope.load_step();
  };
  $scope.next_step = function(){
    $scope.current_step += 1;
    $scope.load_step();
  };
  $scope.close = function(result){
    dialog.close(result)
  };
  $scope.load_step();
}
