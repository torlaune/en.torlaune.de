(function() {
  var barh;

  barh = function(selector, data, options) {
    var bar, bar_height, chart, width, x;
    if (options && options.width) {
      width = options.width;
    } else {
      width = 400;
    }
    bar_height = 26;
    x = d3.scale.linear().domain([
      0, d3.max(data, function(d) {
        return d.value;
      })
    ]).range([0, width]);
    chart = d3.select(selector).attr('width', width).attr('height', bar_height * data.length);
    bar = chart.selectAll('g').data(data).enter().append('g').attr('transform', function(d, i) {
      return 'translate(0,' + i * bar_height + ')';
    });
    bar.append('rect').attr('width', function(d) {
      return x(d.value);
    }).attr('height', bar_height - 4);
    return bar.append('text').attr('x', 3).attr('y', bar_height / 2).attr('dy', bar_height / 16).text(function(d) {
      return d.name;
    });
  };

  ((typeof exports !== "undefined" && exports !== null) || this).barh = barh;

}).call(this);
