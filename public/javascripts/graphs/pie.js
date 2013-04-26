var data = [],
  series = 5;
for (var i = 0; i < series; i++) {
  data[i] = {
    label: "vm " + (i + 1),
    data: Math.floor(Math.random() * 100) + 1
  }
}

var placeholder = $("#datacenter-pie");
$(function(){
  $.plot(placeholder, data, {
    series: {
      pie: { 
        innerRadius: 0.4,
        show: true
      }
    }
  });
});