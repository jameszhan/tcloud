angular.module('webvirtDirectives', ['webvirtUtils']).
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
  })
  .directive('toplist', function($q, $http, $timeout, $pollingPool) {   
    return {
      restrict: 'E',
      scope: {
        url: '@'
      },
      transclude: true,
      link: function(scope, element, attrs){
        var deferred = $q.defer();
        deferred.promise.then(function(){
          $pollingPool.add(function(){
            $http.get(attrs.url).success(function(data){
              scope.tops = data;
            });
          });
        }).then(function(){
          $pollingPool.run();
        });
        
        $timeout(function(){
          deferred.resolve();
        }, 300);
      }, 
      templateUrl: '/partials/shared/_top.html'
    };
  })
  .directive('curvegraph', function($pollingPool){
    return {
      restrict: 'E',
      scope: {
        url: '@'
      },
      link: function(scope, element, attrs){
        var plot = $.plot(element, [], {
          yaxis: {
            min: 0,
            max: 100
          },
          xaxis: {
            ticks: [[0, "0"], [60, "1"], [120, "2"], [180, "3"], [240, "4"], [300, "5"], [360, "6"], [420, "7"], [480, "8"], [540, "9"]],
            show: true
          }
        });
        
        $pollingPool.add(function(){
          $http.get(attrs.url).success(function(data){
            plot.setData([data]);
            plot.draw();
          });
        });
      }
    };
  });
