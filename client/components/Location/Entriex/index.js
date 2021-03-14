var EntryView = require('./Entry');
var ui = require('tresdb-ui');

module.exports = function (location, entries) {
  // Parameters:
  //   location
  //     location object
  //   entries
  //     an array of entries
  //

  var children = {};  // id -> entryView

  this.bind = function ($mount) {

    var appendEntry = function (entry) {
      var id = entry._id;
      children[id] = new EntryView(location, entry);
      // New container for entry
      $mount.append('<div id="entry-' + id + '"></div>');
      children[id].bind($('#entry-' + id));
    };

    entries.forEach(function (entry) {
      appendEntry(entry);
    });
  };

  this.unbind = function () {
    ui.unbindAll(children);
  };
};
