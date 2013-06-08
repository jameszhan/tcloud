function HostUpsertDialogCtrl($scope, dialog, Util, Host){
  $scope.close = function(result){
    dialog.close(result)
  };
    
  $scope.do_upsert = function(){
    if($scope.host){
      new Host($scope.host)[$scope.action](function(data){
        if(data.success){
          if($scope.action == "$save"){
            Util.update_list(dialog.context_scope.hosts, $scope.host);
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

function HostActivateDialogCtrl($scope, dialog){
  $scope.close = function(result){
    dialog.close(result)
  }

  $scope.do_save_activate_config = function(){
    
  }

  $scope.host = dialog.context_scope.selected_host;
  
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
  
/********************* Task Calendar Start ******************************/
function TaskCalendarDialogCtrl($scope, dialog, DataCenter, Util){
  $scope.close = function(result){
    dialog.close(result)
  };
  
  $scope.priorities = [{name: '低', value: 10}, {name: '普通', value: 5}, {name: '高', value: 0}];
  $scope.durations = [{name: '不限', value: 0}, {name: '1分钟', value: 1 * 60 * 1000}, {name: '3分钟', value: 3 * 60 * 1000}, 
    {name: '5分钟', value: 5 * 60 * 1000}, {name: '10分钟', value: 10 * 60 * 1000}, {name: '20分钟', value: 20 * 60 * 1000}, 
    {name: '30分钟', value: 30 * 60 * 1000}, {name: '1小时', value: 60 * 60 * 1000}, {name: '2小时', value: 2 * 60 * 60 * 1000}, 
    {name: '3小时', value: 3 * 60 * 60 * 1000}, {name: '5小时', value: 5 * 60 * 60 * 1000}, {name: '8小时', value: 8 * 60 * 60 * 1000}, 
    {name: '10小时', value: 10 * 60 * 60 * 1000}, {name: '12小时', value: 12 * 60 * 60 * 1000}, {name: '24小时', value: 24 * 60 * 60 * 1000}, 
    {name: '48小时', value: 24 * 60 * 60 * 1000}, {name: '72小时', value: 72 * 60 * 60 * 1000}];    
  $scope.duration = 0;
  $scope.start_time = "08:00";
  $scope.event = {
    priority: 5
  }  
  
  if(dialog.context_scope.selected_event){
    $scope.title = "更新任务";
    $scope.action = 'update_task'; 
    copy($scope.event, dialog.context_scope.selected_event, 'id', 'title', 'desc', 'start', 'priority');   
    $scope.event.start = Date.begin_of_date($scope.event.start);
    $scope.start_time = dialog.context_scope.selected_event.start.format("hh:mm");
  } else {
    $scope.title = "添加任务";
    $scope.action = 'create_task';
    if(dialog.context_scope.selected_date){
      $scope.event.start = dialog.context_scope.selected_date;
    }
  }   
  
  function event_duration(){    
    var time_ms = $scope.event.start.getTime();    
    if((/^(\d{2})\:(\d{2})$/gi).test($scope.start_time)){   
      var constant = 60 * 1000;   
      var ms = + RegExp.$1 * 60 * constant + RegExp.$2 * 60 * constant;
      time_ms += ms;
    }
    return {
      start: new Date(time_ms),
      end: new Date(time_ms + $scope.duration)
    };
  }
  
  $scope.create_task = function(){
    angular.extend($scope.event, event_duration());
    DataCenter.add_task({id: dialog.context_scope.datacenter.id, task: $scope.event}, function(event){        
      dialog.context_scope.events.push(event);
      dialog.close();
    });
  };
  
  $scope.update_task = function(){
    angular.extend($scope.event, event_duration());
    DataCenter.update_task({id: dialog.context_scope.datacenter.id, task: $scope.event}, function(event){
      Util.update(dialog.context_scope.events, [event]);  
      dialog.close();
    });    
  };
  
  $scope.do_submit = function(){
    $scope[$scope.action]();
  };
  
  function copy(dst, src){    
    //angular.extend($scope.event, dialog.context_scope.selected_event);  //Here is a bug.
    if(arguments.length > 2){
      var property_names = [].slice.call(arguments, 2);
      for(var i = 0; i < property_names.length; i++){
        var name = property_names[i];
        dst[name] = src[name]
      }
    }else{
      angular.extend(dst, src);
    }
  }
}
/********************* Task Calendar End ******************************/

/********************* VM Management Start ******************************/

function VMWorkflowDialogCtrl($scope, VM, dialog, Util) {  
  
  $scope.close = function(result){
    dialog.close(result)
  };
  
  $scope.current_step = 1;
  $scope.steps = ["虚拟机设置", "操作系统类型", "选择计算方案", "选择存储方案", "选择网络方案", "确认创建"];
  $scope.view_types = ['vnc'];
  
  var selected_vm = dialog.context_scope.selected_vm;  
  if(selected_vm){
    $scope.action = "$update";
    $scope.vm = selected_vm;
  } else {
    $scope.action = "$save";
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
            Util.update_list(dialog.context_scope.vms, $scope.vm);
          }
          Util.update_activities(data);
          dialog.close("Save Successful!");
        }
      });
    }
    dialog.close();
  };

  load_step();
}

function VMConfigDialogCtrl($scope, VM, dialog, Util){
  $scope.close = function(result){
    dialog.close(result)
  }
  $scope.vm = dialog.context_scope.selected_vm;

  $scope.do_update = function(){
    if($scope.vm){
      new VM($scope.vm).$update(function(data){
        if(data.success){
          Util.update_activities(data);
          dialog.close("Save Successful!");
        }
      });
    }
    dialog.close();
  }
}

function SaveAsTemplateDialogCtrl($scope, dialog, VM, Util){
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

function VMMigrateDialogCtrl($scope, dialog, VM, Util){
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


/********************* VM Management End ******************************/

/********************* Network Management Start ******************************/

function NetworkConfigDialogCtrl($scope, dialog, Util, Network){

  $scope.close = function(result){
    dialog.close(result);
  }

  $scope.do_upsert = function(){
    if($scope.network){
      new Network($scope.network)[$scope.action](function(data){
        if(data.success){
          if($scope.action == "$save"){
            Util.update_list(dialog.context_scope.networks, $scope.network);
          }
          Util.update_activities(data);
          dialog.close("Save Successful!");
        }
      });
    }
  };
  $scope.security_levels = [{value: "低"},{value: "中"},{value: "高"}];

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
  $scope.network.security_level = $scope.security_levels[1];
}



function SecurityRuleDialogCtrl($scope, dialog, Util, SecurityRule){
  $scope.close = function(result){
    dialog.close(result);
  }

  $scope.do_upsert = function(){
    if($scope.security_rule){
      new SecurityRule($scope.security_rule)[$scope.action](function(data){
        if(data.success){
          if($scope.action == "$save"){
            Util.update_list(dialog.context_scope.security_rules, $scope.security_rule);  
          }
          Util.update_activities(data);
          dialog.close("Save Successful!");
        }
      });
    }
  };

  var security_rule = dialog.context_scope.selected_rule;
  $scope.data_directions = [{"key":"in"},{"key":"out"},{"key":"inout"}];
  $scope.security_levels = [{value: "低"},{value: "中"},{value: "高"}];
    
  if(security_rule){
    $scope.title = "编辑配置网络";
    $scope.action = "$update";
    $scope.security_rule = security_rule;
  } else {
    $scope.title = "配置网络";
    $scope.action = "$save";
    $scope.security_rule = {};
  }
  $scope.security_rule.data_direction = $scope.data_directions[0];
  $scope.security_rule.security_level = $scope.security_levels[1];
}


/********************* Network Management End ******************************/

/********************* Storage Start ******************************/
function StorageConfigDialogCtrl($scope, dialog, Util, Storage){
  $scope.close = function(result){
    dialog.close(result);
  }

  $scope.do_upsert = function(){
    if($scope.storage){
      new Storage($scope.storage)[$scope.action](function(data){
        if(data.success){
          if($scope.action == "$save"){
            Util.update_list(dialog.context_scope.storages, $scope.storage);
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

/********************* Storage End ******************************/

/********************* Proposal Start ******************************/
function StorageProposalDialogCtrl($scope, dialog, Util, Proposal){
  $scope.close = function(result){
    dialog.close(result);
  }

  $scope.do_upsert = function(){
    if($scope.storage){
      new Proposal($scope.storage)[$scope.action](function(data){
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

function NetworkProposalDialogCtrl($scope, dialog, Util, Proposal){
  $scope.close = function(result){
    dialog.close(result);
  }

  $scope.do_upsert = function(){
    if($scope.network){
      new Proposal($scope.network)[$scope.action](function(data){
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

function ComputeProposalDialogCtrl($scope, dialog, Util, Proposal){
  $scope.close = function(result){
    dialog.close(result);
  }

  $scope.do_upsert = function(){
    if($scope.compute){
      new Proposal($scope.compute)[$scope.action](function(data){
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

/********************* Proposal End ******************************/


/********************* Backup Strategy Start ********************/


function BackupStrategyDialogCtrl($scope, dialog, Util, BackupStrategy){
  $scope.close = function(result){
    dialog.close(result);
  }

  $scope.do_upsert = function(){
    if($scope.backupstrategy){
      new BackupStrategy($scope.backupstrategy)[$scope.action](function(data){
        if(data.success){
          if($scope.action == "$save"){
            Util.update_list(dialog.context_scope.backupstrategies, $scope.backupstrategy);
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


/********************* Backup Strategy End  *********************/

/************************ Cluster Start  ***********************/

function ClusterConfigCtrl($scope, dialog, Util, Cluster){
  $scope.close = function(result){
    dialog.close(result);
  }

  $scope.save_cluster = function(){
    console.log("save cluster!");
    dialog.close();
  }
}

/************************ Cluster End  ************************/
