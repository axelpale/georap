var marked = require('marked');
var dompurify = require('dompurify');

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

exports.flash = function ($el, color) {
  // Change element background color temporarily.
  // Useful to highlight things.
  //
  // Parameters:
  //   $el: jQuery element
  //   color: a hex color string
  //
  var DURATION = 2;
  var DELAY = 2;
  var SECOND = 1000;
  var original = $el.css('background-color');
  $el.css('background-color', color);
  $el.css('transition', 'background-color ' + DURATION + 's');
  window.setTimeout(function () {
    $el.css('background-color', original);
  }, DELAY * SECOND);
  window.setTimeout(function () {
    $el.css('transition', 'unset');
  }, (DURATION + DELAY) * SECOND);
}

exports.markdownToHtml = function (markdown) {
  // Convert (possibly dirty) markdown to safe HTML.
  var dangerousHTML = marked(markdown);
  return dompurify.sanitize(dangerousHTML);
}
