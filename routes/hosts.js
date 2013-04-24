exports.show = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/hosts/0' + req.params.id + '.json');  
}