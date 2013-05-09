exports.index = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/backup_strategys.json');  
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
      target: "backupstrategy", 
      target_type: "BackupStrategy", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});  
}

exports.status = function(req, res){  
  res.set("ContentType", "application/json");
  var ids = req.body.ids;
  console.log("status for backupstrategy %a", ids);
  res.render("templates/backupstrategy_status.json", {ids: ids});  
}

exports.save = function(req, res){
  res.set("ContentType", "application/json");
  console.log("save BackupStrategy", req.body);
  res.json({success: true, activities: [
    {
      id: 118, 
      name: 'ADD', 
      target: "backupstrategy", 
      target_type: "BackupStrategy", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]
  });
}

exports.update = function(req, res){
  res.set("ContentType", "application/json");
  console.log("update BackupStrategy", req.body);
  res.json({success: true, activities: [
    {
      id: 116, 
      name: 'UPDATE', 
      target: "backupstrategy", 
      target_type: "BackupStrategy", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]
  });
}