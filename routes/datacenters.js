exports.top_hosts = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/dc_top_hosts.json');  
}

exports.show = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/dc/0' + req.params.id + '.json');  
}

exports.events = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/dc/0' + req.params.id + 'events.json');
}


exports.top_hosts = function(req, res){
  res.set("ContentType", "application/json");
  //For actual Logic, you should give the top hosts according to current datacenter id {params.id}
  var rand = Math.ceil(Math.random() * 5)
  res.sendfile(__dirname + '/json/dc_top_hosts/0' + rand + '.json');  
}

exports.top_vms = function(req, res){
  res.set("ContentType", "application/json");
  //For actual Logic, you should give the top vms according to current datacenter id {params.id}
  var rand = Math.ceil(Math.random() * 5)
  res.sendfile(__dirname + '/json/dc_top_vms/0' + rand + '.json');  
}