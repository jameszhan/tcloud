$(function() {

  var data = [],
    totalPoints = 60;

  function getRandomData() {

    if (data.length > 0)
      data = data.slice(1);

    while (data.length < totalPoints) {

      var prev = data.length > 0 ? data[data.length - 1] : 50,
        y = prev + Math.random() * 10 - 5;

      if (y < 0) {
        y = 0;
      } else if (y > 100) {
        y = 100;
      }

      data.push(y);
    }

    var res = [];
    for (var i = 0; i < data.length; ++i) {
      res.push([i * 60, data[i]])
    }
    return res;
  }
  var random_data = getRandomData();
  var plot = $.plot("#cpuplaceholder", [ random_data ], {
    yaxis: {
      min: 0,
      max: 100
    },
    xaxis: {
      ticks: [[0, "0"], [60, "1"], [120, "2"], [180, "3"], [240, "4"], [300, "5"], [360, "6"], [420, "7"], [480, "8"], [540, "9"]],
      show: true
    }
  });
  var last = [], i = 0;
  function update() {
    console.log(angular.toJson(random_data));
    random_data = getRandomData();
    console.log(angular.toJson(random_data));
    plot.setData([random_data]);
    plot.draw();
    i++;
    if(i < 5){
      setTimeout(update, 1000);
    }
  }
  update();
});