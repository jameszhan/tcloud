exports.backups = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/clusters/backups.json');  
}

exports.show = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/dcs/0' + req.params.id + '.json');  
}

exports.events = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/dcs/0' + req.params.id + '/events.json');
}

exports.event_delete = function(req, res){
  console.log("mlx");
  var ids = req.body.ids;
  console.log("Remove event %a", ids);
  //Do your actual migrate operation here.
  res.json({success: true, activities: [
    {
      id: 111, 
      name: 'REMOVE', 
      target: "event", 
      target_type: "Event", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]
  });
}

exports.add_task = function(req, res){
  var task = req.body.task;
  task.id = Math.ceil(Math.random() * 1000);
  console.log(task);
  res.json(task);
}

exports.update_task = function(req, res){
  var task = req.body.task;
  console.log(task);
  res.json(task);
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
