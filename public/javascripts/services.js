angular.module('webvirtServices', []).service('currentCluster', function() {
  var currentCluster = {};
  return {
    get: function(){
      return currentCluster;
    },
    set: function(cluster){
     currentCluster = cluster;
    }
  };
});
