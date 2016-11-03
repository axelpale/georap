var timeago = require('./timeago');

module.exports = function (isoTime) {
  // Parameters:
  //   isoTime
  //     string in ISO format. See ISO 8601

  return '<time datetime="' + isoTime + '" title="' + isoTime + '">' +
         timeago(isoTime) + '</time>';
};
