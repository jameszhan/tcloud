exports.index = function(req, res){
  res.set("ContentType", "application/json");
  console.log("find backup for target :", req.params);
  res.sendfile(__dirname + '/json/backups/backups.json');  
}

exports.status = function(req, res){
  res.set("ContentType", "application/json");
  console.log("find backup status for target: ", req.params);
  res.sendfile(__dirname + '/json/backups/backup_status.json');  
}

exports.delete_all = function(req, res){
  //var ids = req.query['ids'].split(",").map(function(i){return parseInt(i);}); //Here is use DELETE method
  var ids = req.body.ids;
  console.log("delete all backupstrategy %a", ids);
  //Do your actual delete operation here.
  res.json({success: true, activities: [
    {
      id: 113, 
      name: 'DELETE', 
      target: "backup", 
      target_type: "backup", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});  
}


exports.save = function(req, res){
  res.set("ContentType", "application/json");
  console.log("save Backup", req.body);
  res.json({success: true, activities: [
    {
      id: 118, 
      name: 'ADD', 
      target: "backup", 
      target_type: "Backup", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]
  });
}

exports.update = function(req, res){
  res.set("ContentType", "application/json");
  console.log("update Backup", req.body);
  res.json({success: true, activities: [
    {
      id: 116, 
      name: 'UPDATE', 
      target: "backup", 
      target_type: "Backup", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]
  });
}