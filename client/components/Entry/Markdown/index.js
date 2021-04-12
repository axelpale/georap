
var template = require('./template.ejs');
var updateHint = require('./updateHint');
var ui = require('tresdb-ui');

module.exports = function (markdown, opts) {
  // Entry form markdown section.
  //
  // Parameters:
  //   markdown
  //     string, markdown
  //   opts
  //     label
  //       input label text
  //     glyphicon
  //       string, glyphicon class name.
  //       Can contain additional class names separated by spaces.
  //       Set null to '' to disable glyphicon. Defaults to ''.
  //       Example value:
  //         'glyphicon-comment'
  //         'glyphicon-pencil horizontal-flip'
  //     placeholder
  //       textarea placeholder
  //     rows
  //       integer, initial rows in textarea
  //     minLength
  //       integer, 0 by default
  //     maxLength
  //       integer, Infinity by default
  //
  if (!opts) {
    opts = {};
  }
  opts = Object.assign({
    label: 'Message:',
    glyphicon: '',
    placeholder: '',
    rows: 3,
    minLength: 0,
    maxLength: Infinity,
    focus: true,
  }, opts);

  var $elems = {};

  this.bind = function ($mount) {
    $mount.html(template({
      markdown: markdown,
      markdownSyntax: ui.markdownSyntax(),
      label: opts.label,
      glyphicon: opts.glyphicon,
      placeholder: opts.placeholder,
      rows: opts.rows,
    }));

    $elems.textarea = $mount.find('textarea');

    // Display message hint
    $elems.hint = $mount.find('.markdown-hint');
    var handleHint = function () {
      var len = $elems.textarea.val().length;
      updateHint($elems.hint, len);
    };
    handleHint(); // init
    $elems.textarea.on('input', handleHint); // on text input

    // Open markdown syntax
    $elems.syntaxOpen = $mount.find('.markdown-syntax-open');
    $elems.syntaxOpen.click(function (ev) {
      ev.preventDefault();
      ui.toggleHidden($mount.find('.markdown-syntax'));
    });

    // Focus to message
    if (opts.focus) {
      $elems.textarea.focus();
    }
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
      // Move text cursor to text end.
      $elems.textarea.prop('selectionStart', $elems.textarea.val().length);
      $elems.textarea.prop('selectionEnd', $elems.textarea.val().length);
    }
  };

  this.unbind = function () {
    ui.offAll($elems);
  };
};
