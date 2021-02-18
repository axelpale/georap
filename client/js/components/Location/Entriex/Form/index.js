// module EntryForm
//
// takes in an entry, blank or prefilled (edit)
//
// no submit cancel or delete buttons
//
// is able to create attachments
//
// temporary store of content for interrupted creation or edit
//
// either data export or submit method
//   submit target can adapt if given entry has id or not
//
// behavior can adapt if id or not
//
var template = require('./template.ejs');
var markdownSyntax = require('../lib/markdownSyntax.ejs');

// Kilobyte
var K = 1024;

module.exports = function (entry) {

  var self = this;

  self.bind = function ($mount) {

    $mount.html(template({
      entry: entry,
      isNew: '_id' in entry,
      markdownSyntax: markdownSyntax,
      limit: Math.round(tresdb.config.uploadSizeLimit / (K * K)),
    }));
  };

  self.unbind = function () {

  };
};
