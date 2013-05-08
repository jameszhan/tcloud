exports.index = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/shortcuts.json');  
}

exports.status = function(req, res){  
  res.set("ContentType", "application/json");
  var ids = req.body.ids;
  console.log("status for shortcuts %a", ids);
  res.render("templates/shortcuts_status.json", {ids: ids});  
}

exports.delete_all = function(req, res){
  //var ids = req.query['ids'].split(",").map(function(i){return parseInt(i);}); //Here is use DELETE method
  var ids = req.body.ids;
  console.log("delete all shortcuts %a", ids);
  //Do your actual delete operation here.
  res.json({success: true, activities: [
    {
      id: 112, 
      name: 'DELETE', 
      target: "shortcuts", 
      target_type: "Shortcut", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});  
}