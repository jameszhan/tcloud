exports.show = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/dcs/0' + req.params.id + '.json');  
}

exports.events = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/dcs/0' + req.params.id + '/events.json');
}


exports.top_hosts = function(req, res){
  res.set("ContentType", "application/json");
  //For actual Logic, you should give the top hosts according to current datacenter id {params.id}
  var hosts = ["Dell", "IBM", "Apple", "HP", "Intel", "MIC"];
  res.render("templates/tops.json", {hosts: hosts});  
}


exports.top_vms = function(req, res){
  res.set("ContentType", "application/json");
  //For actual Logic, you should give the top vms according to current datacenter id {params.id}
  var vms = ["OSX", "Windows", "CentOS", "Redhat", "Ubuntu", "Unix", "Windows2008"];
  var rand = Math.ceil(Math.random() * 5)
  res.render("templates/tops.json", {hosts: vms});   
}


exports.tasks = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/dcs/0' + req.params.id + '/tasks.json');
}
