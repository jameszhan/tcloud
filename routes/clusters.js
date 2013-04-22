exports.show = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/clusters/0' + req.params.id + '.json');  
}

exports.top_hosts = function(req, res){
  res.set("ContentType", "application/json");
  //For actual Logic, you should give the top hosts according to current cluster id {params.id}
  var rand = Math.ceil(Math.random() * 5)
  res.sendfile(__dirname + '/json/clusters/top_hosts/0' + rand + '.json');  
}

exports.top_vms = function(req, res){
  res.set("ContentType", "application/json");
  //For actual Logic, you should give the top hosts according to current cluster id {params.id}
  var rand = Math.ceil(Math.random() * 5)
  res.sendfile(__dirname + '/json/clusters/top_vms/0' + rand + '.json');  
}