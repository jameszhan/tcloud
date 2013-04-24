exports.show = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/hosts/0' + req.params.id + '.json');  
}


exports.status = function(req, res){  
  res.set("ContentType", "application/json");
  var ids = req.body.ids;
  console.log("status for hosts %a", ids);
  res.render("templates/hosts_status.json", {ids: ids});  
}

