window.$polling = (function(){
  var tasks = [], run = function(){
    for(var i = 0; i < tasks.length; i++){
      tasks[i]();
    }      
  }, schedule = function(){
    run();
    window.setTimeout(function(){
      schedule();
    }, 3000); 
  };
  return {
    add: function(task, type, interval) {
      tasks.push(task);
    },
    schedule: schedule
  }
})();

$polling.schedule()

angular.module('webvirtDirectives', []).
  directive('searchtree', function($q, $http, $templateCache) {
    function _filter(data, text){
      var status = false;      
      if(!data){
        return false;
      }
      if(data instanceof Array){
        for(var i = 0; i < data.length; i++){
          if(_filter(data[i], text)){
            status = true
          }
        }
      } else {  
        var re = new RegExp(text, "gi");
        if(data.children){
          //BRANCH NODE
          data.open = status = _filter(data.children, text) || (data.name && data.name.search(re) >= 0);                           
        } else {
          //LEAF NODE              
          data.open = status =  (data.name && data.name.search(re) >= 0);
        }                     
      }
      return status
    }
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        classname: '@'
      },
      link: function(scope, element, attrs){
        var _tree = element.find("#search-tree")
        element.on('keyup', '.search', function(){
          _filter(scope.data, scope.search)
          $.fn.zTree.init(_tree, {target: '_self'}, scope.data);
        });
        $http.get(attrs.url).success(function(data, status, headers, config) {
          scope.data = data
          $.fn.zTree.init(_tree, {}, scope.data)
        }).error(function(data, status, headers, config) {
          scope.data = []
        });        
      }, 
      template:
        '<div class="ng-serach-tree">' +
          '<div class="row-fluid">' + 
              '<input type="search" ng-model="search" class="search span12" />' + 
          '</div>' + 
          '<ul id="search-tree" class="{{classname}}" ng-transclude></ul>' +
        '</div>'
    };
  }).
  directive('toplist', function($q, $http, $templateCache) {    
    return {
      restrict: 'E',
      scope: {
        url: '@'
      },
      transclude: true,
      link: function(scope, element, attrs){
        var changed = false;
        scope.$watch('url', function(new_value, old_value){       
          if(changed){
            $polling.add(function(){
              $http.get(new_value).success(function(data){
                scope.tops = data;
              });
            }, scope);
          } 
          changed = true
        });
      }, 
      templateUrl: '/partials/shared/_top.html'
    };
  });
