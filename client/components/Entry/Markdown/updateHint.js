
module.exports = function ($messageHint, message, opts) {
  if (!opts) {
    opts = {};
  }
  opts = Object.assign({
    minLength: 0,
    maxLength: Infinity,
  }, opts);

  var len = message.length;
  var min = opts.minLength;
  var max = opts.maxLength;

  if (len === 0 && min > 0) {
    // Empty message; hint to input something
    $messageHint.removeClass('text-danger');
    $messageHint.addClass('text-info');
    $messageHint.html('enter at least ' + min + ' characters');
  } else if (len < min && min > 0) {
    // Too short message
    $messageHint.removeClass('text-danger');
    $messageHint.addClass('text-info');
    $messageHint.html((min - len) + ' more to go...');
  } else if (len <= max && max < Infinity) {
    // Ok length, show how much left until maximum
    $messageHint.removeClass('text-danger');
    $messageHint.addClass('text-info');
    $messageHint.html((max - len) + ' characters left');
  } else if (max < Infinity) {
    // Too long.
    $messageHint.removeClass('text-info');
    $messageHint.addClass('text-danger');
    $messageHint.html((max - len) + ' characters left');
  } else {
    // Ok length, no maximum, no message
    $messageHint.removeClass('text-danger');
    $messageHint.addClass('text-info');
    $messageHint.html('');
  }
};
