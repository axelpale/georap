var commentModel = require('georap-models').comment;

module.exports = function (comment) {
  var ageMs = commentModel.getAgeMs(comment);
  var maxAgeMs = georap.config.comments.secondsEditable * 1000;
  return ageMs > maxAgeMs;
};
