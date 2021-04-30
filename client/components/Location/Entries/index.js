var EntryView = require('../../Entry');
var ui = require('georap-ui');
var rootBus = require('georap-bus');

module.exports = function (location, entries) {
  // Parameters:
  //   location
  //     location object
  //   entries
  //     an array of entries
  //

  var $mount = null;
  var children = {};  // id -> entryView
  var bus = rootBus.sub();
  var self = this;

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    var appendEntry = function (entry, prepend) {
      // Parameters
      //   entry
      //     entry object
      //   prepend
      //     set true to add to beginning, false to add to bottom
      //
      var id = entry._id;
      children[id] = new EntryView(entry);
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

    bus.on('location_entry_removed', function (ev) {
      var id = ev.data.entryId;
      if (id in children) {
        children[id].unbind();
        delete children[id];
        $('#entry-' + id).remove();
      }
    });

    bus.on('location_entry_moved_out', function (ev) {
      var id = ev.data.entryId;
      if (id in children) {
        children[id].unbind();
        delete children[id];
        $('#entry-' + id).remove();
      }
    });
  };

  self.unbind = function () {
    if ($mount) {
      bus.off();
      ui.unbindAll(children);
      children = {};
      $mount = null;
    }
  };
};
