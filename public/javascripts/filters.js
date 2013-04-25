angular.module('webvirtFilters', []).filter('bytes', function() {
  var kilobytes = 1024, megabytes = kilobytes * 1024, gigabytes = megabytes * 1024, 
    terabytes = gigabytes * 1024, petabytes = terabytes * 1024, exabytes = petabytes * 1024;
  return function(num){
    if(num > exabytes){
      return "" + num / exabytes + "EB";
    }else if(num > petabytes){
      return "" + num / petabytes + "PB";
    }else if(num > terabytes){
      return "" + num / terabytes + "TB";
    }else if(num > gigabytes){
      return "" + num / gigabytes + "GB";
    }else if(num > megabytes){
      return "" + num / megabytes + "MB";
    }else if(num > kilobytes){
      return "" + num / kilobytes + "KB";
    } else { 
      return "" + num + "B"
    }
  };
}).filter('startFrom', function() {
  return function(input, start) {
    input || (input = []);
    start = +start; //parse to int
    return input.slice(start);
  }
}).filter('range', function(){
  return function(input, total){
    for(var i = 0; i < total; i++){
      input.push(i);
    }
    return input;
  };
}).filter('os', function(){
  return function(input,os_type){
    var ret=[];
    for (var i=0; i<input.length; i++){
      if(input[i].os_type==os_type) {
        ret.push(input[i]);
      }
    }
    return ret;
  }
});
