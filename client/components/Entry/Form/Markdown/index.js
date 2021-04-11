
var template = require('./template.ejs');
var ui = require('tresdb-ui');

module.exports = function (markdown) {
  // Entry form markdown section.
  //
  // Parameters:
  //   markdown
  //     string, markdown
  //

  var $elems = {};

  this.bind = function ($mount) {
    $mount.html(template({
      markdown: markdown,
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

  this.focus = function () {
    if ($elems.textarea) {
      $elems.textarea.focus();
      // Text cursor to text end.
      $elems.textarea.prop('selectionStart', $elems.textarea.val().length);
      $elems.textarea.prop('selectionEnd', $elems.textarea.val().length);
    }
  };

  this.unbind = function () {
    ui.offAll($elems);
  };
};
