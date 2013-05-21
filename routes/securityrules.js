
exports.save = function(req, res){
  res.set("ContentType", "application/json");
  console.log("save security rule", req.body);
  res.json({success: true, activities: [
    {
      id: 1180, 
      name: 'ADD', 
      target: "network", 
      target_type: "SecurityRule", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]
  });
}

exports.update = function(req, res){
  res.set("ContentType", "application/json");
  console.log("update vm", req.body);
  res.json({success: true, activities: [
    {
      id: 1160, 
      name: 'UPDATE', 
      target: "SecurityRule", 
      target_type: "SecurityRule", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]
  });
}

exports.index = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/networks/security_rules.json');  
}


exports.show = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/networks/security_rule.json');  
}


exports.delete_all = function(req, res){
  //var ids = req.query['ids'].split(",").map(function(i){return parseInt(i);}); //Here is use DELETE method
  var ids = req.body.ids;
  console.log("delete all networks %a", ids);
  //Do your actual delete operation here.
  res.json({success: true, activities: [
    {
      id: 112, 
      name: 'DELETE', 
      target: "networks", 
      target_type: "SecurityRule", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});  
}


