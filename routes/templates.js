exports.index = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/templates.json');  
}

exports.delete_all = function(req, res){
  var ids = req.body.ids;
  console.log("delete all templates %a", ids);
  //Do your actual delete operation here.
  res.json({success: true, activities: [
    {
      id: 131, 
      name: 'DELETE', 
      target: "Template", 
      target_type: "Template", 
      start_time: new Date().toISOString(), 
      end_time: new Date().toISOString(),
      status: 'requested'
    }]});  
}