var template = require('./template.ejs');
var entryModel = require('tresdb-models').entry;
var CommentsView = require('./Comments');
var ui = require('tresdb-ui');
var account = tresdb.stores.account;

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     entry object.
  //

  var children = {};

  this.bind = function ($mount) {
    $mount.html(template({
      entryId: entry._id,
      username: entry.user,
      isOwner: (entry.user === account.getName()),
      flagstamp: ui.flagstamp(entry.flags),
      timestamp: ui.timestamp(entry.time),
      hasMarkdown: entryModel.hasMarkdown(entry),
      markdownHtml: ui.markdownToHtml(entry.markdown),
      images: entryModel.getImages(entry),
      nonImages: entryModel.getNonImages(entry),
    }));

    children.comments = new CommentsView(entry);
    children.comments.bind($mount.find('.entry-comments-container'));
  };

  this.unbind = function () {
    Object.keys(children).forEach(function (k) {
      children[k].unbind();
    });
  };
};
