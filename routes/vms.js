var util = require('util');

exports.reset_backup = function(req, res){
  console.log("Reset %d from backup %d", req.params.id, req.params.backup_id);
  //Do your actual snapshot operation here.
  res.json({success: true, activities: [
    {
      id: 121, 
      name: 'reset_backup', 
      target: "vms", 
      target_type: "VM", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});  
}

exports.save_template = function(req, res){
  console.log("Save template for vm %d as template %s", req.params.id, util.inspect(req.body.template));
  //Async job for generate template for specify vms.
  res.json({success: true, activities: [
    {
      id: 111, 
      name: 'TEMPLATE', 
      target: "vms", 
      target_type: "VM", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});  
}

exports.migrate = function(req, res){
  console.log("Migration for vm %d to host %s", req.params.id, util.inspect(req.body.migration));
  //Do your actual migrate operation here.
  res.json({success: true, activities: [
    {
      id: 115, 
      name: 'MIGRATE', 
      target: "vms", 
      target_type: "VM", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});  
}


exports.migration_hosts = function(req, res){
  res.json([{
    name: "HOST1",
    id: 1
  }, {
    name: "HOST2",
    id: 2
  }, {
    name: "HOST3",
    id: 3
  }]);
}

exports.delete_all = function(req, res){
  //var ids = req.query['ids'].split(",").map(function(i){return parseInt(i);}); //Here is use DELETE method
  var ids = req.body.ids;
  console.log("delete all vms %a", ids);
  //Do your actual delete operation here.
  res.json({success: true, activities: [
    {
      id: 110, 
      name: 'DELETE', 
      target: "vms", 
      target_type: "VM", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});  
}


exports.start = function(req, res){
  var ids = req.body.ids;
  console.log("Startup vms %a", ids);
  //Do your actual start operation here.
  res.json({success: true, activities: [
    {
      id: 116, 
      name: 'START', 
      target: "vms", 
      target_type: "VM", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});  
}

exports.shutdown = function(req, res){
  var ids = req.body.ids;
  console.log("Shutdown vms %a", ids);
  //Do your actual shutdown operation here.
  res.json({success: true, activities: [
    {
      id: 117, 
      name: 'SHUTDOWN', 
      target: "vms", 
      target_type: "VM", 
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
      target: "vms", 
      target_type: "VM", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});  
}

exports.suspend = function(req, res){
  var ids = req.body.ids;
  console.log("Suspend vms %a", ids);
  //Do your actual suspend operation here.
  res.json({success: true, activities: [
    {
      id: 119, 
      name: 'SUSPEND', 
      target: "vms", 
      target_type: "VM", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});  
}

exports.snapshot = function(req, res){
  var ids = req.body.ids;
  console.log("Snapshot vms %a", ids);
  //Do your actual snapshot operation here.
  res.json({success: true, activities: [
    {
      id: 120, 
      name: 'SNAPSHOT', 
      target: "vms", 
      target_type: "VM", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});  
}

exports.operate = function(req, res){
  var ids = req.body.ids;
  console.log("Snapshot vms %a", ids);
  //Do your actual snapshot operation here.
  res.json({success: true, activities: [
    {
      id: 121, 
      name: 'operate', 
      target: "vms", 
      target_type: "VM", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});  
}

exports.status = function(req, res){  
  res.set("ContentType", "application/json");
  var ids = req.body.ids;
  console.log("status for vms %a", ids);
  res.render("templates/vms_status.json", {ids: ids});  
}


exports.show = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/vms/0' + req.params.id + '.json');  
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