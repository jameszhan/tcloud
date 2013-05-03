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
  .directive('piechart', function($q){
    return {
      restrict: 'E',
      scope: {
        initial: '@',
        width: '@',
        height: '@',
      },
      transclude: true,
      link: function(scope, element, attrs) {
        var draw_pie_chart = function(data){
          element.find(".chart").plot(data, { 
            series: {
              pie: { 
                show: true,
                radius: 1,
                label: {
                  show: true,
                  radius: 3/5,
                  formatter: function(label, series){
                    return '<div style="font-size:10px;text-align:center;padding:2px;color:white;">'+label+'<br/>'+Math.round(series.percent)+'%</div>';
                  },
                  background: { opacity: 0.1 }
                }
              }
            },
            legend: {
              show: false
            }
          });
        };
        
        scope.$watch('initial', function(new_value, old_value){
          data = [];
          if(new_value != undefined){   
            angular.forEach(new_value, function(val, key){
              data.push({label: key, data: val});
            });  
            draw_pie_chart(data);
          }
        });
      }, 
      template: '<div>' 
        + '<div class="chart" width="{{width}}" height="{{height}}" style="width:{{width}}px; height:{{height}}px"></div>' 
        + '<div class="hide" ng-transclude></div>'
        + '</div>'
    };
  })
  .directive('curvegraph', function($q, $http, $timeout, $pollingPool){
    return {
      restrict: 'E',
      scope: {
        url: '@',
        width: '@',
        height: '@',
        max: '@',
        min: '@'
      },
      link: function(scope, element, attrs){
        var usage = [], ticks = [];
        for(var i = 0; i < 10; i++){
          usage.push(50);
          ticks.push([i * 60, i]);
        }
        
        var build_line = function(){
          var line = [];
          for(var i = 0; i < usage.length; i++){
            line.push([i * 60, usage[i]]);
          }
          return line;
        };
        
        scope.$watch('width', function(new_value, old_value){
          if(new_value != undefined){            
            deferred.resolve();
          }
        });

        var deferred = $q.defer();
        deferred.promise.then(function(){
          //var plot = element.find(".graph").plot([line], {
          var min = parseInt(attrs.min) || 0, max = parseInt(attrs.max) || 100;
          var plot = $.plot(element.find(".graph"), [build_line()], {
            yaxis: {
              min: min,
              max: max
            },
            xaxis: {
              ticks: ticks,
              show: true
            }
          });
        
          $pollingPool.add(function(){
            $http.get(attrs.url).success(function(data){
              usage.shift();              
              usage.push(data.value);
              
              plot.setData([build_line()]);
              plot.draw();
            });            
          });
          
        }).then(function(){
          $pollingPool.run();
        });
        
      },
      template: '<div class="graph" width="{{width}}" height="{{height}}" style="width:{{width}}px; height:{{height}}px"></div>'
    };
  });
