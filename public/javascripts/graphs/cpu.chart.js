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
      res.push([i * 10, data[i]])
    }
    return res;
  }

  var plot = $.plot("#cpuplaceholder", [ getRandomData() ], {
    yaxis: {
      min: 0,
      max: 100
    },
    xaxis: {
      ticks: [[0, "0"], [60, "1"], [120, "2"], [180, "3"], [240, "4"], [300, "5"], [360, "6"], [420, "7"], [480, "8"], [540, "9"]],
      show: true
    }
  });

  function update() {
    plot.setData([getRandomData()]);
    plot.draw();
    setTimeout(update, 1000);
  }
  update();
});