
var getEntryView = require('./lib/getEntryView');

module.exports = function (location) {

  var entries = location.getEntriesInTimeOrder();
  var entryViews = entries.map(function (entry) {
    return getEntryView(entry);
  });

  this.bind = function ($mount) {
    entries.forEach(function (e, i) {
      $mount.append('<div id="' + e.getId() + '"></div>');
      var v = entryViews[i];
      v.bind($('#' + e.getId()));
    });
  };

  this.unbind = function () {
    entryViews.forEach(function (v) {
      v.unbind();
    });
  };
};
