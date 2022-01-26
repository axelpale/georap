var __ = georap.i18n.__;

module.exports = function () {
  return '<strong>' + __('syntax') + ':</strong>' +
    '<p>' +
    '**' + __('bold') + '** = <strong>' + __('bold') + '</strong><br>' +
    '*' + __('emphasize') + '* = <em>' + __('emphasize') + '</em><br>' +
    '[' + __('this-is-link') + '](http://example.com) =' +
    ' <a href="http://example.com">' + __('this-is-link') + '</a><br><br>' +
    '<a href="https://en.support.wordpress.com/markdown-quick-reference/"' +
    ' target="_blank">' + __('see-more') + '</a>' +
    '</p>';
};
