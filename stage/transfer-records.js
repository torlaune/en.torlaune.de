(function() {
  var add_node, add_player_fee, add_team_fee, agg_transfers, close_modal, draw_sankey, format, formatNumber, graph, init_sankey, link_info, make_graph, money_flow_table, node_info, node_map, summary, team_name, transfer_modal, transfer_row;

  node_map = {};

  agg_transfers = {};

  graph = {
    nodes: [],
    links: [],
    data: null,
    summary: {
      total: 0
    },
    teams: {},
    players: {}
  };

  formatNumber = d3.format(',.0f');

  format = function(d) {
    return formatNumber(d) + '€';
  };

  add_node = function(name) {
    if (!node_map.hasOwnProperty(name)) {
      graph.nodes.push({
        name: name
      });
      node_map[name] = graph.nodes.length - 1;
    }
    return node_map[name];
  };

  add_team_fee = function(name, fee) {
    if (!graph.teams.hasOwnProperty(name)) {
      graph.teams[name] = 0;
    }
    return graph.teams[name] += fee;
  };

  add_player_fee = function(name, fee) {
    if (!graph.players.hasOwnProperty(name)) {
      graph.players[name] = 0;
    }
    return graph.players[name] += fee;
  };

  team_name = function(s) {
    return s.replace(/[FT]:/, '');
  };

  make_graph = function(csv) {
    var fee, from_team, key, row, teams, to_team, transfer_key, _i, _len, _results;
    graph.data = csv;
    for (_i = 0, _len = csv.length; _i < _len; _i++) {
      row = csv[_i];
      from_team = add_node('F:' + row['From Team Name']);
      to_team = add_node('T:' + row['To Team Name']);
      transfer_key = from_team + '|' + to_team;
      if (!agg_transfers.hasOwnProperty(transfer_key)) {
        agg_transfers[transfer_key] = 0;
      }
      fee = parseInt(row['Transfer Fee']);
      agg_transfers[transfer_key] += fee;
      graph.summary.total += fee;
      add_team_fee(from_team, fee);
      add_team_fee(to_team, -fee);
      add_player_fee(row['Player Name'], fee);
    }
    _results = [];
    for (key in agg_transfers) {
      fee = agg_transfers[key];
      teams = key.split('|');
      _results.push(graph.links.push({
        source: graph.nodes[teams[0]],
        target: graph.nodes[teams[1]],
        value: fee
      }));
    }
    return _results;
  };

  transfer_row = function(row) {
    return '<tr><td>' + row['Rank'] + '</td><td>' + row['Player Name'] + '</td><td>' + row['From Team Name'] + '</td><td>' + row['To Team Name'] + '</td><td>' + row['Transfer Season'] + '</td><td>' + format(row['Transfer Fee']) + '</td></tr>';
  };

  transfer_modal = function(rows) {
    var tm, top;
    d3.select('#transfer-table tbody').html(rows.join(''));
    tm = d3.select('#transfer-modal');
    tm.style('display', 'block');
    top = window.pageYOffset + 200;
    return tm.style('top', top.toString() + 'px');
  };

  close_modal = function() {
    return d3.select('#transfer-modal').style('display', 'None');
  };

  money_flow_table = function() {
    var idx, link, rows, table, _ref;
    graph.links = graph.links.sort(function(a, b) {
      return b.value - a.value;
    });
    table = d3.select('#team-money-flow tbody');
    rows = [];
    _ref = graph.links.slice(0, 15);
    for (idx in _ref) {
      link = _ref[idx];
      rows.push('<tr><td>' + team_name(link.source.name) + '</td><td>' + team_name(link.target.name) + '</td><td>' + format(link.value) + '</td></tr>');
    }
    return table.html(rows.join(''));
  };

  node_info = function(d) {
    var key, row, rows, suffix, tname, _i, _len, _ref;
    if (d.name[0] === 'F') {
      key = 'From Team Name';
      suffix = 'from ';
    } else {
      key = 'To Team Name';
      suffix = 'to ';
    }
    rows = [];
    tname = team_name(d.name);
    _ref = graph.data;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      row = _ref[_i];
      if (row[key] === tname) {
        rows.push(transfer_row(row));
      }
    }
    transfer_modal(rows);
    return d3.select('#transfer-table-suffix').text(suffix + tname);
  };

  link_info = function(d) {
    var from_team, row, rows, to_team, _i, _len, _ref;
    from_team = team_name(d.source.name);
    to_team = team_name(d.target.name);
    rows = [];
    _ref = graph.data;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      row = _ref[_i];
      if (row['From Team Name'] === from_team && row['To Team Name'] === to_team) {
        rows.push(transfer_row(row));
      }
    }
    transfer_modal(rows);
    return d3.select('#transfer-table-suffix').text(from_team + ' to ' + to_team);
  };

  draw_sankey = function() {
    var click_hint, color, height, link, margin, node, path, sankey, svg, width;
    width = parseInt(d3.select('#vis').style('width').replace('px', ''));
    if (width < 400) {
      width = 400;
    }
    click_hint = '\n\nClick for more details.';
    margin = {
      top: 1,
      right: 1,
      bottom: 6,
      left: 1
    };
    width = width - margin.left - margin.right;
    height = 1200 - margin.top - margin.bottom;
    color = d3.scale.category20();
    svg = d3.select('#vis').append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    sankey = d3.sankey().nodeWidth(15).nodePadding(10).size([width, height]).nodes(graph.nodes).links(graph.links).layout(46);
    path = sankey.link();
    link = svg.append('g').selectAll('.link').data(graph.links).enter().append('path').attr('class', 'link').attr('d', path).style('stroke-width', function(d) {
      return Math.max(1, d.dy);
    }).sort(function(a, b) {
      return b.dy - a.dy;
    }).on('click', link_info);
    link.append('title').text(function(d) {
      return team_name(d.source.name) + ' → ' + team_name(d.target.name) + '\n' + format(d.value) + click_hint;
    });
    node = svg.append('g').selectAll('.node').data(graph.nodes).enter().append('g').attr('class', 'node').attr('transform', function(d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });
    node.append('rect').attr('height', function(d) {
      return d.dy;
    }).attr('width', sankey.nodeWidth()).style('fill', function(d) {
      return d.color = color(team_name(d.name));
    }).style('stroke', function(d) {
      return d3.rgb(d.color).darker(2);
    }).on('click', node_info).append('title').text(function(d) {
      return team_name(d.name) + '\n' + format(d.value) + click_hint;
    });
    return node.append('text').attr('x', -6).attr('y', function(d) {
      return d.dy / 2;
    }).attr('dy', '.35em').attr('text-anchor', 'end').attr('transform', null).text(function(d) {
      return team_name(d.name);
    }).filter(function(d) {
      return d.x < width / 2;
    }).attr('x', 6 + sankey.nodeWidth()).attr('text-anchor', 'start');
  };

  summary = function() {
    var player, team_spent, team_spent_name;
    d3.select('#summary-total').text(format(graph.summary.total));
    graph.teams = d3.entries(graph.teams).sort(function(a, b) {
      return b.value - a.value;
    });
    team_spent = graph.teams[graph.teams.length - 1];
    team_spent_name = team_name(graph.nodes[team_spent.key].name);
    d3.select('#summary-team-spent').text(team_spent_name);
    d3.select('#summary-team-spent-total').text(format(team_spent.value));
    team_spent = graph.teams[0];
    team_spent_name = team_name(graph.nodes[team_spent.key].name);
    d3.select('#summary-team-earned').text(team_spent_name);
    d3.select('#summary-team-earned-total').text(format(team_spent.value));
    graph.players = d3.entries(graph.players).sort(function(a, b) {
      return b.value - a.value;
    });
    player = graph.players[0];
    d3.select('#summary-player').text(player.key);
    return d3.select('#summary-player-total').text(format(player.value));
  };

  init_sankey = function(error, csv) {
    make_graph(csv);
    draw_sankey();
    summary();
    money_flow_table();
    d3.select('#transfer-modal .close').on('click', close_modal);
    return document.body.onkeydown = function(e) {
      return e.keyCode === 27 && close_modal();
    };
  };

  ((typeof exports !== "undefined" && exports !== null) || this).init_sankey = init_sankey;

}).call(this);
