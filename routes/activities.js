exports.index = function(req, res){
  res.set("ContentType", "application/json");
  var ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  console.log("Load activities for ", ids);
  res.render("templates/activities.json", {ids: ids});
};

exports.status = function(req, res){
  res.set("ContentType", "application/json");
  var ids = req.body.ids;
  console.log("status for activities ", ids);
  res.render("templates/activities_status.json", {ids: ids});
};
