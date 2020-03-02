var commentConfig = require('./config');
var min = commentConfig.MIN_MESSAGE_LEN;
var max = commentConfig.MAX_MESSAGE_LEN;

module.exports = function ($messageHint, len) {
  if (len === 0) {
    $messageHint.removeClass('text-danger');
    $messageHint.addClass('text-info');
    $messageHint.html('enter at least ' + min + ' characters');
  } else if (len < min) {
    $messageHint.removeClass('text-danger');
    $messageHint.addClass('text-info');
    $messageHint.html((min - len) + ' more to go...');
  } else {
    $messageHint.html((max - len) + ' characters left');
    if (len > max) {
      $messageHint.addClass('text-danger');
      $messageHint.removeClass('text-info');
    } else {
      $messageHint.removeClass('text-danger');
      $messageHint.addClass('text-info');
    }
  }
};
