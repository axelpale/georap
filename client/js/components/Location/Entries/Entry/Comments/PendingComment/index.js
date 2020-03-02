/* eslint-disable no-magic-numbers */
var template = require('./template.ejs');

module.exports = function (entry, tempComment) {
  // Parameters:
  //   entry
  //     Entry model.
  //   tempComment
  //     A local pending comment struct.

  // Public methods

  this.comment = tempComment;

  this.bind = function ($mount) {
    $mount.html(template({
      comment: tempComment,
    }));

    var $listItem = $mount.find('.list-group-item');
    $listItem.css('transition', 'background-color 2s');
    window.setTimeout(function () {
      $listItem.removeClass('list-group-item-success');
    }, 2000);
  };

  this.unbind = function () {};
};