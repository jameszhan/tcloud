function ActivityCtrl($rootScope, Activity){
  Activity.query({}, function(data){    
    $rootScope.activities = data;
  });
}

/********************************** URL(#/datacenters/:id) Start ********************************/
function DataCenterCtrl($scope, $routeParams, $location, $dialog, DataCenter, Host, VM, $pollingPool, Util) {
  $scope.current_target_type = 'DataCenter';
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
  
  $scope.templates = {
    overview: "/partials/datacenters/_overview.html",
    events: "/partials/datacenters/_events.html",
    hosts: "/partials/shared/_host_list.html",
    vms: "/partials/shared/_vm_list.html",
    networks: "/partials/networks/_network_types.html",
    storages: "/partials/storages/_storage_list.html",
    backups: "/partials/shared/_backups.html",
    tasks: "/partials/datacenters/_tasks.html"
  };  
  $scope.current_template = $scope.templates['overview'];

  Util.bind_tab($scope);

  $scope.add_bookmark = function(){
    Util.bookmark($scope,"数据中心", "数据中心快捷方式");
  };  
}


function DataCenterEventCtrl($scope, $routeParams, DataCenterEvent, Util){
  $scope.selected || ($scope.selected = {});
  DataCenterEvent.query({data_center_id: $routeParams.id}, function(events, headersFn){
    $scope.events = events;
    Util.pagination($scope, 'events', 5);
  });

  $scope.do_delete = function(){
    Util.bind($scope, 'events').select(1, 100).confirm("你确定要移除它们吗，此操作将无法恢复!").then(function(events){
      var dataCenterEvent_ids = events.map(function(dataCenterEvent){return dataCenterEvent.id;});
      console.log("REMOVE ALL DataCenterEvent " + dataCenterEvent_ids);
      new DataCenterEvent({data_center_id: $routeParams.id, ids: dataCenterEvent_ids}).$delete_all(function(data){
        if(data.success){
          angular.forEach(events, function(event){
            var index = $scope.events.indexOf(event);
            $scope.events.splice(index, 1);
          });
          Util.update_activities(data);
        }
      });
    });
  };
}

/********************************** URL(#/datacenters/:id) End ********************************/


/********************************** URL(#/clusters/:id) Start ********************************/
function ClusterCtrl($scope, $routeParams, Cluster, Host, VM, $pollingPool, Util, $location) {
  $scope.current_target_type = 'Cluster';
  Cluster.get({id: $routeParams.id}, function(cluster){
    $scope.cluster = cluster;
    $scope.hosts = cluster.hosts;
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

  $scope.templates = {
    overview: "/partials/clusters/_overview.html",
    hosts: "/partials/shared/_host_list.html",
    vms: "/partials/shared/_vm_list.html",
    networks: "/partials/networks/_network_types.html",
    backups: "/partials/shared/_backups.html",    
    storages: "/partials/storages/_storage_list.html",
    disk: "/partials/storages/_storage_list.html",  
    monitoring: "/partials/shared/_monitoring.html"
  };
  $scope.current_template = $scope.templates['overview'];

  Util.bind_tab($scope);
  
  $scope.add_bookmark = function(){
    Util.bookmark($scope, '集群', "集群快捷方式"); 
  };  
}


function MonitoringCtrl($scope, $http, $timeout){
  $scope.template = {
    url: "/partials/shared/_monitoring_list.html"
  };
  $scope.targets = [{name: 'CPU', type: 'cpu'}, {name: 'Memory', type: 'memory'}, {name: 'Disk', type: 'disk'}];
  $scope.intervals = [{name: '1秒', value: '1000'}, {name: '3秒', value: '3000'}, {name: '10秒', value: '10000'}, {name: '30秒', value: '30000'}, {name: '1分', value: '60000'}, {name: '10分', value: '100000'}];
  var today = new Date(), day_before_today = new Date();
  day_before_today.setTime(today.getTime() - 24 * 60 * 60 * 1000);
  $scope.monitoring = {
    start: day_before_today.format('yyyy-MM-ddThh:mm:ss'),
    finish: today.format('yyyy-MM-ddThh:mm:ss')
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
      $('.loading-indicator-modal').modal({ backdrop: 'static' });
      $http.get(url).success(function(data){
        $scope.monitoring.images = data;
        $('.loading-indicator-modal').modal('hide');
      }).error(function(data){
        $('.loading-indicator-modal').modal('hide');
      });
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

/********************************** URL(#/clusters/:id) End ********************************/

/********************************** URL(#/hosts/:id) Start ********************************/
function HostCtrl($scope, $routeParams, Host, VM, $pollingPool, Util, $location) {
  $scope.selected || ($scope.selected = {});
  $scope.current_target_type = 'Host';
  Host.get({id: $routeParams.id}, function(host){
    $scope.host = host;
    $scope.hosts = [host]; //Here is compatible with action_bar.
    $scope.vms = $scope.host.virtual_machines;
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
  
  $scope.templates = {
    overview: "/partials/hosts/_overview.html",
    vms: "/partials/shared/_vm_list.html",
    backups: "/partials/shared/_backups.html"
  };
  $scope.current_template = $scope.templates['overview'];
  
  Util.bind_tab($scope);
  
  $scope.add_bookmark = function(){
    Util.bookmark($scope, '主机', "主机快捷方式");
  }; 
}

/********************************** URL(#/hosts/:id) End ********************************/

/********************************** URL(#/vms/:id) Start ********************************/
function VMCtrl($scope, $routeParams, VM, Util, $location) {  
  $scope.selected || ($scope.selected = {});
  VM.get({id: $routeParams.id}, function(vm){
    $scope.vm = vm;
    $scope.vms = [vm]; //Here is compatible with action_bar.
  });
  
  $scope.templates = {
    overview: "/partials/vms/_overview.html",
    snapshots: "/partials/vms/_snapshots.html"
  };
  $scope.current_template = $scope.templates['overview'];
  
  Util.bind_tab($scope);
  
  $scope.add_bookmark = function(){
    Util.bookmark($scope, '虚拟机', "虚拟机快捷方式");
  };
}

function VMSnapshotCtrl($scope, $routeParams, $location, VM, Util){
  VM.snapshots({id: $routeParams.id}, function(snapshots){
    $scope.snapshots = snapshots;
    Util.pagination($scope, 'snapshots', 5);
  });
  
  $scope.do_add = function(){
     if(confirm("要增加快照?")){
       new VM({id: $routeParams.id}).$snapshot(function(data){
         if(data.success){
           snapshot = {
             "name": "snapshot",
             "desc": "snapshot",
             "created_at": "today"
           }
           Util.update_list($scope.snapshots, snapshot)
           Util.update_activities(data);
         }
       });
     }
   }

   $scope.do_recover = function(){
     alert("已删除无法恢复");
   }

   $scope.do_delete = function(){
     Util.bind($scope, 'snapshots').select(1, 100).confirm("你确定要移除它们吗，此操作将无法恢复!").then(function(snapshots){
       var snapshot_ids = snapshots.map(function(snapshot){return snapshot.id;});
       console.log("REMOVE ALL snapshots " + snapshot_ids);
       new VM({id: $routeParams.id, ids: snapshot_ids}).$delete_snapshots(function(data){
         if(data.success){
           angular.forEach(snapshots, function(snapshot){
             var index = $scope.snapshots.indexOf(snapshot);
             $scope.snapshots.splice(index, 1);
           });
           Util.update_activities(data);
         }
       });
     });
   }
}
/********************************** URL(#/vms/:id) End ********************************/


/********************************** Shared Controller Start ********************************/

function BackupCtrl($scope, $routeParams, Backup, BackupStrategy, Util) {
  var params = {target_id: $routeParams.id, target_type: $scope.current_target_type};
  BackupStrategy.query(params, function(data){
    $scope.backup_strategies = data;
  });
  
  Backup.status(params, function(data){
    $scope.backup_status = data;
  });  
  
  Backup.query(params, function(data){
    $scope.backups = data;
  });
  
  $scope.do_reset = function(backup){
    VM.reset_backup({id: backup.instance.id, backup_id: backup.id}, Util.update_activities);
  };
}

function NetworkMgmtCtrl($scope, $dialog, $routeParams, Network, Util){
  var params = {target_id: $routeParams.id, target_type: $scope.current_target_type};  
  $scope.selected || ($scope.selected = {});

  Network.query(params, function(networks){
    $scope.networks = networks;
    Util.pagination($scope, 'networks', 5);
  });

  $scope.do_delete = function(){
    Util.bind($scope, 'networks').select(1, 100).confirm("你确定要移除它们吗，此操作将无法恢复!").then(function(networks){
      var network_ids = networks.map(function(network){return network.id;});
      console.log("REMOVE ALL networks " + network_ids);
      new Network({ids: network_ids}).$delete_all(function(data){
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
    $scope.selected_type = null;
    Util.dialog("/partials/networks/_network_dialog.html", 'NetworkConfigDialogCtrl', $scope);
  };

  $scope.do_edit = function(){
    Util.bind($scope, 'networks').select(1, 1).then(function(networks){
      $scope.selected_type = networks[0];
      Util.dialog("/partials/networks/_network_dialog.html", 'NetworkConfigDialogCtrl', $scope);
    });
  };
}

function StorageCtrl($scope, $dialog, $routeParams, Storage, Util){
  var params = {target_id: $routeParams.id, target_type: $scope.current_target_type};  

  $scope.selected || ($scope.selected = {});
  
  Storage.get(params, function(storage){
    $scope.storages = storage.items;
    $scope.status = storage.status;
    Util.pagination($scope, 'storages', 5);
  });

  $scope.show_details = function(){
    $scope.selected_storage = this.storage;
  }

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
    $scope.selected_storage = null;
    Util.dialog("/partials/storages/_storage_dialog.html", 'StorageConfigDialogCtrl', $scope, {dialogClass: 'modal mini'});
  };

  $scope.do_edit = function(){
    Util.bind($scope, 'storages').select(1, 1).then(function(storages){
      $scope.selected_storage = storages[0];
      Util.dialog("/partials/storages/_storage_dialog.html", 'StorageConfigDialogCtrl', $scope, {dialogClass: 'modal mini'});
    });
  };
}

/********************************** Shared Controller END ********************************/

/******************************************************** ROOT Section Start *******************************************/
function ShortcutCtrl($scope, $rootScope, Shortcut, Util){
  $rootScope.selected || ($rootScope.selected = {});
  if(!$rootScope.shortcuts){
    Shortcut.query({}, function(data){
      $rootScope.shortcuts = data;
    });
  }
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
  };
}


function TemplateCtrl($scope, $routeParams, Template, Util){
  $scope.selected || ($scope.selected = {});
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

  $scope.do_delete = function(){
    Util.bind($scope, 'templates').select(1, 100).confirm("你确定要移除它们吗，此操作将无法恢复!").then(function(templates){
      var template_ids = templates.map(function(template){return template.id;});
      console.log("REMOVE ALL templates " + template_ids);
      new Template({ids: template_ids}).$delete_all(function(data){
        if(data.success){
          angular.forEach(templates, function(template){
            var index = $scope.templates.indexOf(template);
            $scope.templates.splice(index, 1);
          });
          Util.update_activities(data);
        }
      });
    });
  };

  $scope.add_bookmark = function(){
    Util.bookmark($scope, '模板', "模板快捷方式");
  };
}



function NetworkCtrl($scope, $routeParams, Network, Util){
  $scope.add_bookmark = function(){
    Util.bookmark($scope, '网络安全', "网络安全快捷方式");
  };
}


function SecurityRuleCtrl($scope, $dialog, $routeParams, SecurityRule, Util){  
  $scope.selected || ($scope.selected = {});  
  SecurityRule.query({}, function(security_rules){
    $scope.security_rules = security_rules;
    Util.pagination($scope, 'security_rules', 5);
  });

  $scope.do_delete = function(){
    Util.bind($scope, 'security_rules').select(1, 100).confirm('你确定要移除它们吗，此操作将无法恢复!').then(function(security_rules){
      var security_rule_ids = security_rules.map(function(security_rule){return security_rule.id;});
      console.log("REMOVE ALL security_rules " + security_rule_ids);
      new SecurityRule({ids: security_rule_ids}).$delete_all(function(data){
        if(data.success){
          angular.forEach(security_rules, function(security_rule){
            var index = $scope.security_rules.indexOf(security_rule);
            $scope.security_rules.splice(index, 1);
          });
          Util.update_activities(data);
        }
      });
    });
  };

  $scope.do_add = function(){
    $scope.selected_rule = null;
    Util.dialog("/partials/networks/_security_rule_dialog.html", "SecurityRuleDialogCtrl", $scope);
  };

  $scope.do_edit = function(){
    Util.bind($scope, 'security_rules').select(1, 1).then(function(security_rules){
      $scope.selected_rule = security_rules[0]
      Util.dialog("/partials/networks/_security_rule_dialog.html", "SecurityRuleDialogCtrl", $scope);
    });
  };
}


function BackupStrategyCtrl($scope, $dialog, $routeParams, BackupStrategy, Util) {
  $scope.selected || ($scope.selected = {});
  
  BackupStrategy.query({}, function(strategies){
    $scope.backupstrategies = strategies;
    Util.pagination($scope, 'backupstrategies', 5);
  });

  $scope.do_delete = function(){
    Util.bind($scope, 'backupstrategies').select(1, 100).confirm('你确定要移除它们吗，此操作将无法恢复!').then(function(backupstrategies){
      var backupstrategy_ids = backupstrategies.map(function(backupstrategy){return backupstrategy.id;});
      console.log("REMOVE ALL backupstrategies " + backupstrategy_ids);
      new BackupStrategy({ids: backupstrategy_ids}).$delete_all(function(data){
        if(data.success){
          angular.forEach(backupstrategies, function(backupstrategy){
            var index = $scope.backupstrategies.indexOf(backupstrategy);
            $scope.backupstrategies.splice(index, 1);
          });
          Util.update_activities(data);
        }
      });
    });
  }

  $scope.do_add = function(){
    $scope.selected_backupstrategy = null;
    Util.dialog("/partials/backupstrategies/_backupstrategy_dialog.html", "BackupStrategyDialogCtrl", $scope);
  };

  $scope.do_edit = function(){
    Util.bind($scope, 'backupstrategies').select(1, 1).then(function(backupstrategies){      
      $scope.selected_backupstrategy = backupstrategies[0];
      Util.dialog("/partials/backupstrategies/_backupstrategy_dialog.html", "BackupStrategyDialogCtrl", $scope);
    });
  };

  Util.bind_tab($scope);
  
  $scope.add_bookmark = function(){
    Util.bookmark($scope, '备份策略', "备份策略快捷方式"); 
  };
}

function ProposalCtrl($scope, $routeParams, Proposal, Util){
  Util.bind_tab($scope);
  
  $scope.add_bookmark = function(){
    Util.bookmark($scope, '方案管理', "方案管理快捷方式"); 
  };
}

function ComputeProposalCtrl($scope, $dialog, $routeParams, Proposal, Util){
  $scope.selected || ($scope.selected = {});

  Proposal.get(function(proposals){
    $scope.computes = proposals.computes;
    Util.pagination($scope, 'computes', 5);
  });

  $scope.do_delete = function(){
    Util.bind($scope, 'computes').select(1, 100).confirm('你确定要移除它们吗，此操作将无法恢复!').then(function(computes){
      var compute_ids = computes.map(function(compute){return compute.id;});
      console.log("REMOVE ALL storages " + compute_ids);
      new Proposal({ids: compute_ids}).$delete_all(function(data){
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
    Util.bind($scope, 'computes').select(1, 1).then(function(computes){
      $scope.selected_compute = computes[0];
      Util.dialog("/partials/proposals/_compute_dialog.html", "ComputeProposalDialogCtrl", $scope);
    });
  };
}



function StorageProposalCtrl($scope, $dialog, $routeParams, Proposal, Util){
  $scope.selected || ($scope.selected = {});

  Proposal.get(function(proposals){
    $scope.storages = proposals.storages;
    Util.pagination($scope, 'storages', 5);
  });

  $scope.do_delete = function(){
    Util.bind($scope, 'storages').select(1, 100).confirm('你确定要移除它们吗，此操作将无法恢复!').then(function(storages){
      var storage_ids = storages.map(function(storage){return storage.id;});
      console.log("REMOVE ALL storages " + storage_ids);
      new Proposal({ids: storage_ids}).$delete_all(function(data){
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
    Util.bind($scope, 'storages').select(1, 1).then(function(storages){
      $scope.selected_storage = storages[0];
      Util.dialog("/partials/proposals/_storage_dialog.html", "StorageProposalDialogCtrl", $scope);
    });
  };
}



function NetworkProposalCtrl($scope, $dialog, $routeParams, Proposal, Util){  
  $scope.selected || ($scope.selected = {});

  Proposal.get(function(proposals){
    $scope.networks = proposals.networks;
    Util.pagination($scope, 'networks', 5);
  });

  $scope.do_delete = function(){
    Util.bind($scope, 'networks').select(1, 100).confirm('你确定要移除它们吗，此操作将无法恢复!').then(function(networks){
      var network_ids = networks.map(function(network){return network.id;});
      console.log("REMOVE ALL storages " + network_ids);
      new Proposal({ids: network_ids}).$delete_all(function(data){
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
    Util.bind($scope, 'networks').select(1, 1).then(function(networks){
      $scope.selected_network = networks[0];
      Util.dialog("/partials/proposals/_network_dialog.html", "NetworkProposalDialogCtrl", $scope);
    });
  };
}


function ArchitectCtrl($scope, Util){
  $scope.add_bookmark = function(){
    Util.bookmark($scope, '基础架构', "基础架构快捷方式");
  };
}

function GlobalConfigCtrl($scope, Util){
  Util.bind_tab($scope);
  
  $scope.add_bookmark = function(){
    Util.bookmark($scope, '全局配置', "全局配置快捷方式");
  };
}

function PlatformCtrl($scope, Util){
  Util.bind_tab($scope);
  
  $scope.add_bookmark = function(){
    Util.bookmark($scope, '平台信息', "平台信息快捷方式");
  };
}
/******************************************************** ROOT Section End *******************************************/
