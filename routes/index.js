exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.tree_list = function(req, res){
  res.set("ContentType", "application/json");
  res.sendfile(__dirname + '/json/tree_list.json');  
}