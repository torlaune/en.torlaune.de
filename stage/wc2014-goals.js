(function() {
  var init, team_events, teams;

  teams = {};

  team_events = function(team_code, match_events) {
    var e, minute, _i, _len, _ref, _results;
    if (!teams.hasOwnProperty(team_code)) {
      teams[team_code] = {
        goals: []
      };
    }
    _results = [];
    for (_i = 0, _len = match_events.length; _i < _len; _i++) {
      e = match_events[_i];
      minute = parseInt(e.time, 10);
      if (minute > 120) {
        console.log(e.time);
      }
      if ((_ref = e.type_of_event) === 'goal' || _ref === 'goal-own' || _ref === 'goal-penalty') {
        _results.push(teams[team_code].goals.push(e));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  init = function(config, data) {
    var d, _i, _len;
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      d = data[_i];
      team_events(d.home_team.code, d.home_team_events);
      team_events(d.away_team.code, d.away_team_events);
    }
    return console.log(teams['ALG']);
  };

  ((typeof exports !== "undefined" && exports !== null) || this).init = init;

}).call(this);
