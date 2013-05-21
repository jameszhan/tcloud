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
  
/********************* Task Calendar Start ******************************/
function TaskCalendarDialogCtrl($scope, dialog, DataCenter){
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
    $scope.task.start = dialog.context_scope.current_date.format("yyyy-MM-dd");
    $scope.task.end = dialog.context_scope.current_date.format("yyyy-MM-dd");
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
  if(security_rule){
    $scope.title = "编辑配置网络";
    $scope.action = "$update";
    $scope.security_rule = security_rule;
    $scope.security_rule.data_direction = $scope.data_directions[0];
  } else {
    $scope.title = "配置网络";
    $scope.action = "$save";
    $scope.security_rule = {};
    $scope.security_rule.data_direction = $scope.data_directions[0];    
  }
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