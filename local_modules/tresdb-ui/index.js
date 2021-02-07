var marked = require('marked');

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
