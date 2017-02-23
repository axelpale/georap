
var getEntryView = require('./lib/getEntryView');

module.exports = function (location) {

  var _entryViews;
  var _handleEntryCreated;

  this.bind = function ($mount) {

    var entries = location.getEntries();
    _entryViews = entries.map(function (entry) {
      return getEntryView(entry);
    });

    entries.forEach(function (e, i) {
      $mount.append('<div id="' + e.getId() + '"></div>');
      var v = _entryViews[i];
      v.bind($('#' + e.getId()));
    });

    _handleEntryCreated = function (newEntry) {
      // Create view and store it among others
      var newEntryView = getEntryView(newEntry);
      _entryViews.unshift(newEntryView);
      // Bind the new view.
      $mount.prepend('<div id="' + newEntry.getId() + '"></div>');
      newEntryView.bind($('#' + newEntry.getId()));
    };

    location.on('location_entry_created', _handleEntryCreated);
  };

  this.unbind = function () {
    _entryViews.forEach(function (v) {
      v.unbind();
    });

    location.off('location_entry_created', _handleEntryCreated);
  };
};
