exports.monitoring = function(req, res){
  console.log("monitor host %d with type: %s(%s => %s)", req.params.id, req.params.type, req.params.start, req.params.finish);
  var images = [];
  for(var i = 0; i < 3; i++){
    images.push({ url: "/images/" + req.params.type + '_monitor.jpg' });
  }
  function sleep(milliseconds) {
    var start_time = new Date().getTime();
    while (new Date().getTime() < start_time + milliseconds);
  }
  
  //sleep(15000);
  //res.json(images);
  setTimeout(function(){    
    res.json(images);
  }, 5000);
  //res.set("ContentType", "image/jpeg");
  //res.sendfile(__dirname + '/images/' + req.params.type + '_monitor.jpg');
}

exports.backups = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/clusters/backups.json');  
}

exports.show = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/hosts/0' + req.params.id + '.json');  
}

exports.update = function(req, res){
  res.set("ContentType", "application/json");
  console.log("update host", req.body);
  res.json({success: true, activities: [
    {
      id: 115, 
      name: 'UPDATE', 
      target: "host", 
      target_type: "HOST", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});
}


exports.save = function(req, res){
  res.set("ContentType", "application/json");
  console.log("save host", req.body);
  res.json({success: true, activities: [
    {
      id: 111, 
      name: 'ADD', 
      target: "host", 
      target_type: "HOST", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});
}

exports.status = function(req, res){  
  res.set("ContentType", "application/json");
  var ids = req.body.ids;
  console.log("status for hosts %a", ids);
  res.render("templates/hosts_status.json", {ids: ids});  
}

exports.remove_all = function(req, res){
  var ids = req.body.ids;
  console.log("Remove all hosts %a", ids);
  //Do your actual migrate operation here.
  res.json({success: true, activities: [
    {
      id: 111, 
      name: 'REMOVE', 
      target: "host", 
      target_type: "HOST", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});  
}

exports.maintain = function(req, res){
  var ids = req.body.ids;
  console.log("Maintain all hosts %a", ids);
  //Do your actual migrate operation here.
  res.json({success: true, activities: [
    {
      id: 111, 
      name: 'MAINTAIN', 
      target: "host", 
      target_type: "HOST", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});  
}

exports.activate = function(req, res){
  var ids = req.body.ids;
  console.log("Migrate all hosts %a", ids);
  //Do your actual migrate operation here.
  res.json({success: true, activities: [
    {
      id: 115, 
      name: 'ACTIVATE', 
      target: "host", 
      target_type: "HOST", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});  
}

exports.start = function(req, res){
  var ids = req.body.ids;
  console.log("Startup hosts %a", ids);
  //Do your actual start operation here.
  res.json({success: true, activities: [
    {
      id: 116, 
      name: 'START', 
      target: "HOST", 
      target_type: "HOST", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});  
}

exports.shutdown = function(req, res){
  var ids = req.body.ids;
  console.log("Shutdown hosts %a", ids);
  //Do your actual shutdown operation here.
  res.json({success: true, activities: [
    {
      id: 117, 
      name: 'SHUTDOWN', 
      target: "HOST", 
      target_type: "HOST", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});  
}

exports.reboot = function(req, res){
  var ids = req.body.ids;
  console.log("Reboot vms %a", ids);
  //Do your actual reboot operation here.
  res.json({success: true, activities: [
    {
      id: 118, 
      name: 'REBOOT', 
      target: "HOST", 
      target_type: "HOST", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});  
}

var strftime = require('strftime');

exports.current_cpu = function(req, res){
  res.render("templates/current_cpu.json", {current_time: strftime('%H:%M:%S')});  
}

exports.current_memory = function(req, res){
  res.render("templates/current_memory.json", {current_time: strftime('%H:%M:%S')});  
}

exports.current_traffic = function(req, res){
  res.render("templates/current_traffic.json", {current_time: strftime('%H:%M:%S')});  
}