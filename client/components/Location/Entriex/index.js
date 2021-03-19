var EntryView = require('./Entry');
var ui = require('tresdb-ui');
var bus = require('tresdb-bus');

module.exports = function (location, entries) {
  // Parameters:
  //   location
  //     location object
  //   entries
  //     an array of entries
  //

  var children = {};  // id -> entryView

  this.bind = function ($mount) {

    var appendEntry = function (entry, prepend) {
      // Parameters
      //   entry
      //     entry object
      //   prepend
      //     set true to add to beginning, false to add to bottom
      //
      var id = entry._id;
      children[id] = new EntryView(location, entry);
      // New container for entry
      var tmpl = '<div id="entry-' + id + '"></div>';
      if (prepend) {
        $mount.prepend(tmpl);
      } else {
        $mount.append(tmpl);
      }
      children[id].bind($('#entry-' + id));
    };

    entries.forEach(function (entry) {
      appendEntry(entry, false);
    });

    bus.on('location_entry_created', function (ev) {
      var id = ev.data.entryId;
      if (!(id in children)) {
        appendEntry(ev.data.entry, true);
      }
    });

    bus.on('location_entry_changed', function (ev) {
      var id = ev.data.entryId;
      if (id in children) {
        children[id].update(ev);
      }
    });
  };

  this.unbind = function () {
    ui.unbindAll(children);
  };
};
