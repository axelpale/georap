/* eslint-disable no-useless-escape,no-bitwise */

// Forked from
// https://coderwall.com/p/uub3pw/javascript-timeago-func-e-g-8-hours-ago

var templates = {
  prefix: '',
  suffix: ' ago',
  seconds: 'a few seconds',
  minute: 'a minute',
  minutes: '%d minutes',
  hour: 'an hour',
  hours: '%d hours',
  day: 'a day',
  days: '%d days',
  month: 'a month',
  months: '%d months',
  year: 'a year',
  years: '%d years',
};

var template = function (t, n) {
  // Parameters:
  //   t
  //     template id
  //   n
  //     number to template e.g. if n == 6, then 'about 6 hours',
  return templates[t] && templates[t].replace(/%d/i, Math.abs(Math.round(n)));
};

var timer = function (time) {
  // Parameters:
  //   time
  //     ISO 8601 time string

  if (!time) {
    return;
  }

  var t = Date.parse(time); // ms since epoch
  var now = Date.now(); // ms
  var seconds = (now - t) / 1000;
  var minutes = seconds / 60;
  var hours = minutes / 60;
  var days = hours / 24;
  var years = days / 365;

  return templates.prefix + (
    (seconds < 45 && template('seconds', seconds)) ||
    (seconds < 90 && template('minute', 1)) ||
    (minutes < 45 && template('minutes', minutes)) ||
    (minutes < 90 && template('hour', 1)) ||
    (hours < 24 && template('hours', hours)) ||
    (hours < 42 && template('day', 1)) ||
    (days < 30 && template('days', days)) ||
    (days < 45 && template('month', 1)) ||
    (days < 365 && template('months', days / 30)) ||
    (years < 1.5 && template('year', 1)) ||
    template('years', years)
  ) + templates.suffix;
};

module.exports = function (isoTime) {
  return timer(isoTime);
};
