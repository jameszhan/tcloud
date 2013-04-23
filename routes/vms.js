exports.show = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/vms/0' + req.params.id + '.json');  
}