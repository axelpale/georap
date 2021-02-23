var marked = require('marked');
var timestamp = require('timestamp');

// Setup
marked.setOptions({ breaks: true });

exports.isHidden = function ($el) {
  return $el.hasClass('hidden');
};

exports.show = function ($el) {
  $el.removeClass('hidden');
};

exports.hide = function ($el) {
  $el.addClass('hidden');
};

exports.toggleHidden = function ($el) {
  $el.toggleClass('hidden');
};

exports.flash = function ($el) {
  // Change element background color temporarily.
  // Useful to highlight things.
  //
  // Parameters:
  //   $el: jQuery element
  //
  var DURATION = 2;
  var DELAY = 2;
  var SECOND = 1000;
  $el.css('transition', 'background-color ' + DURATION + 's');
  $el.addClass('tresdb-flash');
  window.setTimeout(function () {
    $el.removeClass('tresdb-flash');
  }, DELAY * SECOND);
  window.setTimeout(function () {
    $el.css('transition', 'unset');
  }, (DURATION + DELAY) * SECOND);
};

exports.markdownToHtml = function (markdown) {
  return marked(markdown);
};

exports.timestamp = function (time) {
  return timestamp(time);
};

exports.flagstamp = function (flags) {
  // Convert an array of flags to string
  //
  if (flags && flags.length > 0) {
    return 'a <strong>' + flags.join(' ') + '</strong> ';
  }
  return '';
};

exports.pointstamp = function (points) {
  var p = points;
  var h = '<span class="glyphicon glyphicon-star" aria-hidden="true"></span>';

  if (p > 0) {
    // Plus sign
    h += ' <span>+' + p + '</span>';
  } else if (p < 0) {
    // Special, wide minus sign
    h += ' <span>–' + Math.abs(p) + '</span>';
  } else {
    return ''; // No points
  }

  return h;
};
