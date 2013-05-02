exports.index = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/networks.json');  
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
      target_type: "network", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});  
}

exports.status = function(req, res){  
  res.set("ContentType", "application/json");
  var ids = req.body.ids;
  console.log("status for networks %a", ids);
  res.render("templates/networks_status.json", {ids: ids});  
}

exports.save = function(req, res){
  res.set("ContentType", "application/json");
  console.log("save network", req.body);
  res.json({success: true, activities: [
    {
      id: 114, 
      name: 'ADD', 
      target: "network", 
      target_type: "Network", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});
}

exports.update = function(req, res){
  res.set("ContentType", "application/json");
  console.log("update host", req.body);
  res.json({success: true, activities: [
    {
      id: 116, 
      name: 'UPDATE', 
      target: "network", 
      target_type: "Network", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});
}