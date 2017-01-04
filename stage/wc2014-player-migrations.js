(function() {
  var add_node, data, draw_rankings, draw_sankey, graph, init_sankey, is_from, link_click, link_text, make_graph, node_click, node_map, node_name, node_text, path, position_detail_info, sep, show_players, svg, text_suffix, update_links,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  data = null;

  graph = {
    nodes: [],
    links: [],
    config: null
  };

  node_map = {};

  path = null;

  sep = {
    link: ' → '
  };

  svg = null;

  text_suffix = '\n\nClick to see the migrated players.';

  add_node = function(name) {
    if (!node_map.hasOwnProperty(name)) {
      graph.nodes.push({
        name: name
      });
      node_map[name] = graph.nodes.length - 1;
    }
    return node_map[name];
  };

  node_name = function(s) {
    return s.replace(/[FT]:/, '');
  };

  node_text = function(d) {
    return node_name(d.name) + ': ' + d.value;
  };

  link_text = function(d) {
    return node_name(d.source.name) + sep.link + node_name(d.target.name) + ': ' + d.value;
  };

  is_from = function(s) {
    return s.indexOf('F:') === 0;
  };

  make_graph = function(config) {
    var agg_links, agg_val, from_node, key, link_key, nodes, record, to_node, val, _i, _len, _results;
    agg_links = {};
    graph.config = config;
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      record = data[_i];
      from_node = add_node('F:' + record[config.from.key]);
      to_node = add_node('T:' + record[config.to.key]);
      link_key = from_node + '|' + to_node;
      if (!agg_links.hasOwnProperty(link_key)) {
        agg_links[link_key] = 0;
      }
      agg_val = null;
      if (config.aggregate.key) {
        agg_val = parseInt(record[config.aggregate.key], 10);
      } else {
        agg_val = config.aggregate.value;
      }
      agg_links[link_key] += agg_val;
    }
    _results = [];
    for (key in agg_links) {
      val = agg_links[key];
      nodes = key.split('|');
      _results.push(graph.links.push({
        key: key,
        source: graph.nodes[nodes[0]],
        target: graph.nodes[nodes[1]],
        value: val
      }));
    }
    return _results;
  };

  draw_sankey = function() {
    var color, height, link, margin, node, sankey, width;
    width = parseInt(d3.select('#vis').style('width').replace('px', ''));
    if (width < 400) {
      width = 400;
    }
    margin = {
      top: 1,
      right: 1,
      bottom: 6,
      left: 1
    };
    width = width - margin.left - margin.right;
    height = 1080 - margin.top - margin.bottom;
    color = d3.scale.category20();
    svg = d3.select('#vis').append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    sankey = d3.sankey().nodeWidth(20).nodePadding(7).size([width, height]).nodes(graph.nodes).links(graph.links).layout(32);
    path = sankey.link();
    link = svg.append('g').selectAll('.link').data(graph.links);
    link.enter().append('path').attr('class', 'link').attr('d', path).style('stroke-width', function(d) {
      return Math.max(1, d.dy);
    }).sort(function(a, b) {
      return b.dy - a.dy;
    }).on('click', link_click).append('title').text(function(d) {
      return link_text(d) + text_suffix;
    });
    node = svg.append('g').selectAll('.node').data(graph.nodes).enter().append('g').attr('class', 'node').attr('transform', function(d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });
    node.append('rect').attr('height', function(d) {
      return d.dy;
    }).attr('width', sankey.nodeWidth()).style('fill', function(d) {
      return d.color = color(node_name(d.name));
    }).style('stroke', function(d) {
      return d3.rgb(d.color).darker(2);
    }).on('click', node_click).append('title').text(function(d) {
      return node_text(d) + text_suffix;
    });
    return node.append('text').attr('x', -6).attr('y', function(d) {
      return d.dy / 2;
    }).attr('dy', '.35em').attr('text-anchor', 'end').attr('transform', null).text(function(d) {
      return node_name(d.name);
    }).filter(function(d) {
      return d.x < width / 2;
    }).attr('x', 6 + sankey.nodeWidth()).attr('text-anchor', 'start');
  };

  update_links = function(links) {
    return svg.selectAll('path.link').style('opacity', function(d) {
      if (__indexOf.call(links, d) >= 0) {
        return 1;
      } else {
        return 0;
      }
    });
  };

  draw_rankings = function() {
    var bar_data, bar_options, d, from, rank, to, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
    bar_options = {};
    bar_options.width = parseInt(d3.select('#sidebar').style('width').replace('px', ''), 10);
    rank = graph.links.sort(function(a, b) {
      return b.value - a.value;
    });
    bar_data = [];
    _ref = rank.slice(0, 10);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      d = _ref[_i];
      bar_data.push({
        name: link_text(d),
        value: d.value
      });
    }
    barh('#top-paths', bar_data, bar_options);
    from = graph.nodes.filter(function(d) {
      return is_from(d.name);
    });
    rank = from.sort(function(a, b) {
      return b.value - a.value;
    });
    bar_data = [];
    _ref1 = rank.slice(0, 10);
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      d = _ref1[_j];
      bar_data.push({
        name: node_text(d),
        value: d.value
      });
    }
    barh('#most-emigrations', bar_data, bar_options);
    to = graph.nodes.filter(function(d) {
      return !is_from(d.name);
    });
    rank = to.sort(function(a, b) {
      return b.value - a.value;
    });
    bar_data = [];
    _ref2 = rank.slice(0, 10);
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      d = _ref2[_k];
      bar_data.push({
        name: node_text(d),
        value: d.value
      });
    }
    return barh('#most-immigrations', bar_data, bar_options);
  };

  show_players = function(players) {
    var container;
    players = players.sort(function(a, b) {
      if (a.firstName > b.firstName) {
        return 1;
      } else {
        return -1;
      }
    });
    d3.select('#overlay').style('display', 'block');
    container = d3.select('#detail-info');
    container.selectAll('div.row').remove();
    return container.selectAll('div').data(players).enter().append('div').attr('class', 'row').html(function(d) {
      return '<div class="col-md-2"><img class="img-thumbnail" src="' + d.image + '"/></div>' + '<div class="player-info col-md-10"><h5>' + d.firstName + ' ' + d.lastName + ': ' + d.birthCountry + sep.link + d.nationality + '</h5></div>';
    });
  };

  position_detail_info = function() {
    d3.select('#rankings').style('display', 'none');
    return d3.select('#overlay').style('top', window.pageYOffset + 'px');
  };

  node_click = function(d) {
    var country, key, players, rec, _i, _len;
    position_detail_info();
    if (is_from(d.name)) {
      update_links(d.sourceLinks);
      key = 'birthCountry';
    } else {
      update_links(d.targetLinks);
      key = 'nationality';
    }
    players = [];
    country = node_name(d.name);
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      rec = data[_i];
      if (country === rec[key]) {
        players.push(rec);
      }
    }
    return show_players(players);
  };

  link_click = function(d) {
    var players, rec, _i, _len;
    position_detail_info();
    update_links([d]);
    players = [];
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      rec = data[_i];
      if (node_name(d.source.name) === rec.birthCountry && node_name(d.target.name) === rec.nationality) {
        players.push(rec);
      }
    }
    return show_players(players);
  };

  init_sankey = function(config, csv) {
    data = csv;
    make_graph(config);
    draw_sankey();
    draw_rankings();
    return d3.select('#close-overlay').on('click', function() {
      d3.select('#overlay').style('display', 'none');
      d3.select('#rankings').style('display', 'block');
      return update_links(graph.links);
    });
  };

  ((typeof exports !== "undefined" && exports !== null) || this).init_sankey = init_sankey;

}).call(this);
