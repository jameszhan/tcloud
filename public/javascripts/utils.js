angular.module('webvirtUtils', []).factory("$pollingPool", function($timeout, Fibonacci){
  var current_delay = 0, fib = Fibonacci.instance(), max_delay = 1000, next_delay = function(){
    return current_delay >= max_delay ? current_delay : current_delay = fib() * 1000;
  }, tasks = [], started = false, run = function(){
    for(var i = 0; i < tasks.length; i++){
      tasks[i]();
    }      
  }, schedule = function(){
    run();
    $timeout(schedule, next_delay());
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
}).factory("Util", function($rootScope){
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
    pagination: function($scope, target_name, page_size){
      $scope.current_page = 0;
      $scope.page_size = page_size;

      $scope.$watch('current_page', function(current, old){    
        if(current == 0){
          $scope.prev_class = 'disabled';
        }else{
          $scope.next_class = 'active';
        }
        if(current == $scope.page_count - 1){
          $scope.next_class = 'disabled';
        }else{
          $scope.next_class = 'active';
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
        return $scope[target_name].length <= $scope.page_size;
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
    } 
  };
});


