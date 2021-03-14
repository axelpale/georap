
var template = require('./template.ejs');
var ui = require('tresdb-ui');

module.exports = function (location, entry) {
  // Entry form markdown section.
  //
  // Parameters:
  //   location
  //     location object
  //   entry
  //     entry object with at least the markdown prop set
  //

  var $elems = {};

  this.bind = function ($mount) {
    $mount.html(template({
      markdown: entry.markdown,
      markdownSyntax: ui.markdownSyntax(),
    }));

    $elems.textarea = $mount.find('textarea');

    $elems.syntaxOpen = $mount.find('.markdown-syntax-open');
    $elems.syntaxOpen.click(function (ev) {
      ev.preventDefault();
      ui.toggleHidden($mount.find('.markdown-syntax'));
    });
  };

  this.getMarkdown = function () {
    if ($elems.textarea) {
      return $elems.textarea.val().trim();
    }
    return '';
  };

  this.unbind = function () {
    ui.offAll($elems);
  };
};
