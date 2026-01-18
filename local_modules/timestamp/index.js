// HTML timestamp. Intended for both client and server side
// unlike georap-ui that is for client-side only.

var timeago = require('./timeago');
var locales = require('./locales');

exports.render = function (isoTime, locale) {
  // Render a time HTML element.
  //
  // Parameters:
  //   isoTime
  //     string in ISO format. See ISO 8601.
  //   locale
  //     string, locale code e.g. 'en' or 'fi'
  //
  // Return:
  //   a string
  //
  return '<time datetime="' + isoTime + '" title="' + isoTime + '" ' +
         'data-format="timeago" data-locale="' + locale + '">' +
         timeago(isoTime, locale) + '</time>';
};

exports.exact = function (isoTime, locale) {
  // Pretty exact timestamp.
  //
  // Parameters:
  //   isoTime
  //     a string in ISO format. See ISO 8601.
  //   locale
  //     string, locale code e.g. 'en' or 'fi'
  //
  // Return:
  //   a string
  //

  var dict; // Dictionary of time phrases
  if (locales[locale]) {
    dict = locales[locale];
  } else {
    dict = locales['en'];
  }

  // Drop milliseconds and timezone.
  var date = isoTime.substring(0, 10);
  var time = isoTime.substring(11, 19);
  // Use space as the date-time separator.
  return dict['at'] + date + ' ' + time + ' UTC';
}

// Provide raw timeago function.
exports.timeago = timeago
