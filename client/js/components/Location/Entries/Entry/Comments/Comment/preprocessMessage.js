var marked = require('marked');
var dompurify = require('dompurify');

module.exports = function (msg) {
  var dangerousHTML = marked(msg);
  return dompurify.sanitize(dangerousHTML);
};
