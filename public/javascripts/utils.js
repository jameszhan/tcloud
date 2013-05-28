String.format = function(formatter){
  var _args = [].slice.apply(arguments, [1]);
  return formatter.replace(/\{(\d+)\}/g, function(match, g1, position, str){
    return (_args[g1] || match);
  });
};

alertInfo = function(info){
  var message = '<div class="alert">'+
                  '<button type="button" class="close" data-dismiss="alert">&times;</button>'+
                  '<strong>Warning!</strong> '+ info +
                '</div>';
  return message;
}

Date.begin_of_date = function(date){
  start = $.datepicker.parseDate('yyyy-mm-dd', $.datepicker.formatDate( "yyyy-mm-dd", date));
  return start;
};

Date.prototype.format = function(format){   
  var o = {   
    "M+" : this.getMonth()+1,   
    "d+" : this.getDate(),  
    "h+" : this.getHours(),   
    "m+" : this.getMinutes(),   
    "s+" : this.getSeconds(),  
    "q+" : Math.floor((this.getMonth()+3)/3),   
    "S" : this.getMilliseconds()   
  }   
  if(/(y+)/.test(format)){  
    format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));         
  }   
  for(var k in o){  
    if(new RegExp("(" + k + ")").test(format)){  
      format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));   
    }  
  }  
  return format;   
};

angular.module('webvirtUtils', []).factory("$pollingPool", function($timeout, Fibonacci){
  var current_delay = 0, fib = Fibonacci.instance(), max_delay = 3000, next_delay = function(){
    return current_delay >= max_delay ? current_delay : current_delay = fib() * 1000;
  }, tasks = [], started = false, run = function(){
    for(var i = 0; i < tasks.length; i++){
      tasks[i]();
    }      
  }, schedule = function(){
    run();
   // $timeout(schedule, next_delay());
  }, add = function(task, key){
    task.first_time = true;
    key && (task.key = key);
    tasks.push(task);
  }, clear = function(){
    tasks = [];
  }, remove = function(key){
    var index = -1;
    for(var i = 0; i < tasks.length; i++){
      if(tasks[i].key == key){
        index = i;
        break;
      }
    }
    if(index > -1){
      tasks.splice(index, 1);
    }
  };  
  return {
    schedule: schedule,
    add: add, 
    clear: clear,
    run: function(){
      for(var i = 0; i < tasks.length; i++){
        if(tasks[i].first_time){
          tasks[i]();
          tasks[i].first_time = false;
        }        
      }
    },
    remove: remove,
    set_max_delay: function(delay){
      max_delay = delay;
    }
  };
}).factory("Fibonacci", function(){
  return {
    instance: function(){
      var i = 0, j = 1;
      return function(){   
        var t = i;
        i = j;
        j = t + j;
        return j;
      };
    }
  };
}).factory("Util", function($rootScope, $location, $window, $dialog, $q, Shortcut){
  var colors = {
    h: {backgroundColor: '#cfcfcf', borderColor: '#c0c0c0', textColor: '#9a9a9a'},
    0: {backgroundColor: '#ff3300', borderColor: '#ff9900', textColor: '#f0f0f0'},
    5: {backgroundColor: '#f0f033', borderColor: '#cfcf33', textColor: '#696969'},
    10: {backgroundColor: '#339933', borderColor: '#669966', textColor: '#f0f0f0'}
  }, today = Date.begin_of_date(new Date());
  return {
    update: function(dst, update_data){
      angular.forEach(dst, function(vm){
        angular.forEach(update_data, function(data){            
          if(data.id == vm.id){
            angular.extend(vm, data);
          }
        });
      });
    },
    flatten: function(arr, target){
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
    },
    update_activities: function(data){
      if(data.activities){
        for(var i = 0; i < data.activities.length; i++){  
          $rootScope.activities.unshift(data.activities[i]);
        }
      }
    },
    bind: function($scope, target_name){
      $scope.min_msg = ($scope.min_msg || "你至少应该选择{0}个");
      $scope.max_msg = ($scope.max_msg || "你不能选择超过{0}个");
      var items = $.grep($scope[target_name], function(item) {
        return $scope.selected[item.id];
      }), ok = true;
      return {
        select: function(min, max){
          $(".alert").alert('close');          
          if(items.length < min){
            //alert(String.format($scope.min_msg, min));
            $("#flash").append(alertInfo(String.format($scope.min_msg, min)));
            ok = false;
          }
          if(items.length > max){
            $("#flash").append(alertInfo(String.format($scope.max_msg, min)));
            ok = false;
          }
          return {
            confirm: function(msg){
              if(!ok || !window.confirm(msg)){
                ok = false;
              }
              return {
                then: function(fn){ ok && (fn || angular.noop)(items); }
              };
            },
            then: function(fn){ ok && (fn || angular.noop)(items); }
          };
        }
      }
    },
    pagination: function($scope, target_name, page_size){
      $scope.current_page = 0;
      $scope.page_size = page_size;

      $scope.$watch('current_page', function(current, old){    
        if(current == 0){
          $scope.prev_class = 'disabled';
        }else{
          $scope.prev_class = '';
        }
        if(current == $scope.page_count() - 1){
          $scope.next_class = 'disabled';
        }else{
          $scope.next_class = '';
        }
      });
      
      $scope.prev = function(){
        if($scope.current_page > 0){
          $scope.current_page -= 1;
        }
      };
      
      $scope.page = function(i){
        $scope.current_page = i;
      };
      
      $scope.next = function(){
        if($scope.current_page < $scope.page_count() - 1){
          $scope.current_page += 1;
        }
      };
      
      $scope.page_count = function(){
        if($scope[target_name]){
          return Math.ceil($scope[target_name].length / $scope.page_size);
        }else{
          return 0;
        }
      };
      
      $scope.should_hide = function(){
        return ($scope[target_name] && $scope[target_name].length <= $scope.page_size);
      };
      
      $scope.unselected_all = function(){
        $scope.selected_all = false;
      };
      
      $scope.$watch('selected_all', function(new_value, old_value){
        if(new_value != undefined){
          $scope[target_name].filter(function(target, i){
            if(i >= $scope.current_page * $scope.page_size && i < $scope.current_page * $scope.page_size + $scope.page_size){
              $scope.selected[target.id] = new_value;
            }
          });
        }
      });      
    },
    bind_tab: function($scope){
      $scope.$on('$locationChangeStart', function(e){
        //if($location.absUrl().split('#').length >= 3){
        //  e.preventDefault();
        //}
      });
      $scope.$on('$locationChangeSuccess', function(e){
      });
      
      var hs = $location.absUrl().split('#');
      if(hs.length == 3){
        var h = hs[2];
        //$('.tabbable a:first').tab('show'); //Here is for wrong hash input.
        $('.tabbable a[href="#' + h + '"]').tab('show');//.closest('li').addClass('active'); 
        if($scope.templates){
          $scope.current_template = $scope.templates[h];
        }
      }
      $scope.location = $location.absUrl();
      
      $('a[data-toggle="tab"]').on('shown', function (e) {             
        $scope.$apply(function(){
          $location.hash(e.target.hash.substr(1));
          $scope.location = $location.absUrl();
          $scope.shortcut_name = e.target.hash.substr(1);
        });
        
        //$('#directives-calendar').find('.calendar').fullCalendar('render');
        return false;
      });
    },
    dialog: function(template_url, ctrl_name, $scope, opts){
      var options = angular.extend({
        backdrop: true,
        keyboard: true,
        backdropClick: true,
        templateUrl: template_url,
        controller: ctrl_name
      }, opts)
      var d = $dialog.dialog(options);
      d.context_scope = $scope;
      d.open().then(function(result){
        if(result){
          alert('dialog closed with result: ' + result);
        }
      });
    },
    bookmark: function(shortcut){
      var deferred = $q.defer();
      deferred.promise.then(function(){
        if(shortcut){
          $rootScope.shortcuts.unshift(shortcut);
        }
      });
      if(!$rootScope.shortcuts){
        Shortcut.query({}, function(data){
          $rootScope.shortcuts = data;
          deferred.resolve();
        });
      }else{
        deferred.resolve();
      }      
    },
    update_list: function(list, data){
      if(list){
        data.id = 10 + Math.round(Math.random()*10); 
        list.unshift(data);
      }
    },
    event_with_color: function(e){
      var config = colors[e.priority];
      if(new Date(e.start) < today){
        config = colors['h'];
      }
      angular.extend(e, config);
      return e;
    }
  };
});


