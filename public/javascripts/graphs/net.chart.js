$(function() {

  // We use an inline data source in the example, usually data would
  // be fetched from a server

  var data = [],
    totalPoints = 300;

  function getRandomData() {

    if (data.length > 0)
      data = data.slice(1);

    // Do a random walk

    while (data.length < totalPoints) {

      var prev = data.length > 0 ? data[data.length - 1] : 500,
        y = prev + Math.random() * 100 - 50;

      if (y < 0) {
        y = 0;
      } else if (y > 1000) {
        y = 1000;
      }

      data.push(y);
    }

    // Zip the generated y values with the x values

    var res = [];
    for (var i = 0; i < data.length; ++i) {
      res.push([i, data[i]])
    }

    return res;
  }

  var plot = $.plot("#netplaceholder", [ getRandomData() ], {
    yaxis: {
      min: 0,
      max: 1000
    },
    xaxis: {
      show: true
    }
  });

  function update() {

    plot.setData([getRandomData()]);
    // Since the axes don't change, we don't need to call plot.setupGrid()

    plot.draw();
    setTimeout(update, 50);
  }

  update();

});