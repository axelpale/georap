/* eslint-disable no-useless-escape,no-bitwise */

// Forked from
// https://coderwall.com/p/uub3pw/javascript-timeago-func-e-g-8-hours-ago

var locales = require('./locales');

var apply = function (template, n) {
  // Parameters:
  //   template
  //     template string
  //   n
  //     number to template e.g. if n == 6, then 'about 6 hours',
  return template && template.replace(/%d/i, Math.abs(Math.round(n)));
};

var timer = function (time, locale) {
  // Parameters:
  //   time
  //     ISO 8601 time string
  //   locale
  //     locale string, for example 'en' or 'fi'
  //

  if (!time) {
    return;
  }
  if (!locale) {
    locale = 'en';
  }

  var dict; // Dictionary of time phrases
  if (locales[locale]) {
    dict = locales[locale];
  } else {
    dict = locales['en'];
  }

  var t = Date.parse(time); // ms since epoch
  var now = Date.now(); // ms
  var seconds = (now - t) / 1000;
  var minutes = seconds / 60;
  var hours = minutes / 60;
  var days = hours / 24;
  var years = days / 365;

  return dict.prefix + (
    (seconds < 45 && apply(dict.seconds, seconds)) ||
    (seconds < 90 && apply(dict.minute, 1)) ||
    (minutes < 45 && apply(dict.minutes, minutes)) ||
    (minutes < 90 && apply(dict.hour, 1)) ||
    (hours < 24 && apply(dict.hours, hours)) ||
    (hours < 42 && apply(dict.day, 1)) ||
    (days < 30 && apply(dict.days, days)) ||
    (days < 45 && apply(dict.month, 1)) ||
    (days < 365 && apply(dict.months, days / 30)) ||
    (years < 1.5 && apply(dict.year, 1)) ||
    apply(dict.years, years)
  ) + dict.suffix;
};

module.exports = timer;
