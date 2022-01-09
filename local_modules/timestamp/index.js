// HTML timestamp. Intended for both client and server side
// unlike georap-ui that is for client-side only.

var timeago = require('./timeago');

module.exports = function (isoTime, locale) {
  // Parameters:
  //   isoTime
  //     string in ISO format. See ISO 8601
  //   locale
  //     string, locale code e.g. 'en' or 'fi'
  //
  return '<time datetime="' + isoTime + '" title="' + isoTime +
         '" data-toggle="tooltip" data-placement="bottom">' +
         timeago(isoTime, locale) + '</time>';
};
