angular.module('webvirtDirectives', ['webvirtUtils', 'webvirtContextMenu']).
  directive('searchtree', function($q, $http, $templateCache, ContextMenu) {
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
      return status;
    }

    var show_context_menu = function(e, tree_id, tree_node){
      var context_menu = ContextMenu.find_context_menu(tree_node.url);      
      context_menu.css({"top": e.clientY + "px", "left":e.clientX + "px", "visibility":"visible"});
      $("body").bind("mousedown", ContextMenu.body_mousedown);
    };
    
    var ztree = null, _settings = {
      callback: {
        onRightClick: show_context_menu
      }
    };
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        classname: '@'
      },
      link: function(scope, element, attrs){        
        var _tree = element.find("#search-tree");
        element.on('keyup', '.search', function(){
          _filter(scope.data, scope.search);
          ztree = $.fn.zTree.init(_tree, _settings, scope.data);
        });
        $http.get(attrs.url).success(function(data, status, headers, config) {
          scope.data = data
          ztree = $.fn.zTree.init(_tree, _settings, scope.data);
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
          element.find(".chart").highcharts({
            credits: {
              enabled : false
            },
            chart: {
              plotBackgroundColor: null,
              plotBorderWidth: null,
              plotShadow: false
            },
            title: null,
            tooltip: {
              formatter: function() {
                return '<b>'+ this.point.name +'</b>: '+ this.point.y + '<br />' + this.percentage.toFixed(2) + '%';
              }
            },
            plotOptions: {
              pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                  distance: -30,
                  color: 'white'
                }
              }
            },
            series: [{
              type: 'pie',
              name: 'OS share',
              data: data
            }]
          });
        };
        
        scope.$watch('initial', function(new_value, old_value){
          if(new_value != undefined && new_value != null && new_value != ''){   
            var data = [];
            angular.forEach(angular.fromJson(new_value), function(val, key){
              data.push([key, val]);
            });  
            draw_pie_chart(data);
          }
        });
      }, 
      template: '<div>' 
        + '<div class="chart" width="{{width}}" height="{{height}}" style="min-width:{{width}}px; height:{{height}}px"></div>' 
        + '<div class="hide" ng-transclude></div>'
        + '</div>'
    };
  })
  .directive('curvegraph', function($q, $http, $timeout, $pollingPool){
    return {
      restrict: 'E',
      scope: {
        name: "@",
        suffix: "@",
        title: '@',
        url: '@',
        width: '@',
        height: '@',
        max: '@',
        min: '@'
      },
      link: function(scope, element, attrs){
        var line_datas = [];
        for(var i = 0; i < 10; i++){
          line_datas.push(["00:00:00", 50]);
        }
                
        var deferred = $q.defer();
        
        scope.$watch('url', function(new_value, old_value){
          if(new_value != undefined){            
            deferred.resolve();
          }
        });        
        
        var options = {
          credits: {
            enabled : false
          },
          chart: {
            type: 'spline',
            renderTo: element.find('.graph')[0]
          },
          title: {
            align: 'left'
          },
          subtitle: null,
          xAxis: {
            categories: ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1', '0']
          },
          yAxis: {
            title: null,  
          },
          rangeSelector: {
    	    	selected: 100
    	    },
          tooltip: {
            valueSuffix: ''
          },
          series: [{
            color: '#006900',
            showInLegend: false,
            name: null,
            data: []
          }]
        };
        deferred.promise.then(function(){
          options.series[0].name = scope.name;
          options.yAxis.min = scope.min || 0;
          options.yAxis.max = scope.max || 100; 
          if(scope.title){
            options.title.text = scope.title;
          }
          options.tooltip.valueSuffix = scope.suffix;
          var highcharts = new Highcharts.Chart(options);
          highcharts.series[0].setData(line_datas);
          $pollingPool.add(function(){
            $http.get(attrs.url).success(function(data){
              line_datas.shift();              
              line_datas.push(data);
              highcharts.series[0].setData(line_datas);
            });            
          });          
        }).then(function(){
          $pollingPool.run();
        });
        
      },
      template: '<div class="graph" width="{{width}}" height="{{height}}" style="width:{{width}}px; height:{{height}}px"></div>'
    };
  });
