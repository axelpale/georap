var EntryView = require('./Entry');

module.exports = function (entries) {
  // Parameters:
  //   entries
  //     an array of entries
  //

  var _entryViewsMap = {};  // id -> entryView

  this.bind = function ($mount) {

    var appendEntry = function (entry) {
      var id = entry._id;
      var v = new EntryView(entry);

      _entryViewsMap[id] = v;

      $mount.append('<div id="entry-' + id + '"></div>');
      v.bind($('#entry-' + id));
    };

    entries.forEach(function (entry) {
      appendEntry(entry);
    });
  };

  this.unbind = function () {

  };

};