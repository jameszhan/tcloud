exports.index = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/proposals.json');  
}

exports.delete_all = function(req, res){
  var ids = req.body.ids;
  console.log("delete all proposals %a", ids);
  //Do your actual delete operation here.
  res.json({success: true, activities: [
    {
      id: 112, 
      name: 'DELETE', 
      target: "proposals", 
      target_type: "Proposal", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});  
}

exports.status = function(req, res){  
  res.set("ContentType", "application/json");
  var ids = req.body.ids;
  console.log("status for proposals %a", ids);
  res.render("templates/proposals_status.json", {ids: ids});  
}

exports.update = function(req, res){
  res.set("ContentType", "application/json");
  console.log("update proposals", req.body);
  res.json({success: true, activities: [
    {
      id: 116, 
      name: 'UPDATE', 
      target: "proposals", 
      target_type: "Proposal", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});
}