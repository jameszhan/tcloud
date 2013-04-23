var util = require('util');


exports.delete_all = function(req, res){
  //var ids = req.query['ids'].split(",").map(function(i){return parseInt(i);}); //Here is use DELETE method
  var ids = req.body.ids;
  console.log("delete all vms %a", ids);
  //Do your actual delete operation here.
  res.json({success: true});  
}

exports.save_template = function(req, res){
  var ids = req.body.ids;
  console.log("Save template for vms %a", ids);
  //Async job for generate template for specify vms.
  res.json({success: true});  
}

exports.migrate = function(req, res){
  var ids = req.body.ids;
  console.log("Migrate all vms %a", ids);
  //Do your actual migrate operation here.
  res.json({success: true});  
}

exports.start = function(req, res){
  var ids = req.body.ids;
  console.log("Startup vms %a", ids);
  //Do your actual start operation here.
  res.json({success: true});  
}

exports.shutdown = function(req, res){
  var ids = req.body.ids;
  console.log("Shutdown vms %a", ids);
  //Do your actual shutdown operation here.
  res.json({success: true});  
}

exports.reboot = function(req, res){
  var ids = req.body.ids;
  console.log("Reboot vms %a", ids);
  //Do your actual reboot operation here.
  res.json({success: true});  
}

exports.suspend = function(req, res){
  var ids = req.body.ids;
  console.log("Suspend vms %a", ids);
  //Do your actual suspend operation here.
  res.json({success: true});  
}

exports.snapshot = function(req, res){
  var ids = req.body.ids;
  console.log("Snapshot vms %a", ids);
  //Do your actual snapshot operation here.
  res.json({success: true});  
}







