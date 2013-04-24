angular.module('webvirtUtils', []).factory("$pollingPool", function($timeout, Fibonacci){
  var current_delay = 0, fib = Fibonacci.instance(), key_generator = Fibonacci.instance(), next_delay = function(){
    return current_delay >= 10000 ? current_delay : current_delay = fib() * 500;
  }, tasks = [], started = false, run = function(){
    for(var i = 0; i < tasks.length; i++){
      tasks[i]();
    }      
  }, schedule = function(){
    run();
    $timeout(schedule, next_delay());
  }, add = function(task, key){
    var added = false;
    task.key = (key || key_generator());
    task.first = true;
    for(var i = 0; i < tasks.length; i++){
      if(tasks[i].key == task.key){
        tasks[i] = task;
        added = true;
      }
    }
    if(!added){
      tasks.push(task);
    }
  }, clear = function(){
    tasks = [];
  };  
  return {
    schedule: schedule,
    add: add, 
    clear: clear,
    run: function(){
      for(var i = 0; i < tasks.length; i++){
        if(tasks[i].first){
          tasks[i]();
          tasks[i].first = false;
        }        
      }
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
});


