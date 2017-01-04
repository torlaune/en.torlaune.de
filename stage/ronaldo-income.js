(function() {
  var container, e, euro_to_dollar, factor_avg_wage, factor_ortega, factor_ortega_avg_wage, gain_ortega, income_ronaldo, num, set_val, spain_avg_wage, _i, _j;

  set_val = function(selector, val) {
    return $(selector).each(function(idx, e) {
      return e.innerHTML = val;
    });
  };

  euro_to_dollar = 1.24;

  income_ronaldo = 8e7 / euro_to_dollar;

  gain_ortega = 7e9 / euro_to_dollar;

  spain_avg_wage = 2019 * 12;

  factor_avg_wage = parseInt(income_ronaldo / spain_avg_wage, 10);

  factor_ortega = parseInt(gain_ortega / income_ronaldo, 10);

  factor_ortega_avg_wage = factor_ortega * factor_avg_wage;

  set_val('.answer-avg-wage', factor_avg_wage);

  set_val('.answer-ortega', factor_ortega);

  set_val('.workers-lives', parseInt(factor_avg_wage / 50, 10));

  set_val('.ortega-avg-wage', factor_ortega_avg_wage);

  container = document.getElementById('avg-wage');

  for (num = _i = 1; 1 <= factor_avg_wage ? _i <= factor_avg_wage : _i >= factor_avg_wage; num = 1 <= factor_avg_wage ? ++_i : --_i) {
    e = document.createElement('div');
    e.setAttribute('class', 'worker icon');
    container.appendChild(e);
  }

  container = document.getElementById('ortega');

  for (num = _j = 1; 1 <= factor_ortega ? _j <= factor_ortega : _j >= factor_ortega; num = 1 <= factor_ortega ? ++_j : --_j) {
    e = document.createElement('div');
    e.setAttribute('class', 'ronaldo icon');
    container.appendChild(e);
  }

}).call(this);
