exports.index = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/projects.json');  
}

exports.delete_all = function(req, res){
  var ids = req.body.ids;
  console.log("delete all projects %a", ids);
  //Do your actual delete operation here.
  res.json({success: true, activities: [
    {
      id: 112, 
      name: 'DELETE', 
      target: "projects", 
      target_type: "project", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});  
}

exports.status = function(req, res){  
  res.set("ContentType", "application/json");
  var ids = req.body.ids;
  console.log("status for projects %a", ids);
  res.render("templates/projects_status.json", {ids: ids});  
}

exports.update = function(req, res){
  res.set("ContentType", "application/json");
  console.log("update projects", req.body);
  res.json({success: true, activities: [
    {
      id: 116, 
      name: 'UPDATE', 
      target: "project", 
      target_type: "Project", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});
}