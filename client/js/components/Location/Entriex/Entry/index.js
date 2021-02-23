var template = require('./template.ejs');
var entryModel = require('tresdb-models').entry;
var ui = require('tresdb-ui');
var account = tresdb.stores.account;

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     entry object.
  //

  this.bind = function ($mount) {
    $mount.html(template({
      entryId: entry._id,
      username: entry.user,
      isOwner: (entry.user === account.getName()),
      flagstamp: ui.flagstamp(entry.flags),
      timestamp: ui.timestamp(entry.time),
      hasMarkdown: entryModel.hasMarkdown(entry),
      markdownHtml: ui.markdownToHtml(entry.markdown),
    }));
  };

  this.unbind = function () {
  };
};
