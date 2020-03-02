// This model is responsible for rawLocation.entries array.

var rawEventToRawEntry = require('./lib/rawEventToRawEntry');
var EntryModel = require('./Entry/Model');

var emitter = require('component-emitter');

module.exports = function (rawEntries, location) {
  // Parameters:
  //   rawEntries
  //     raw.entries. Location's array of raw entry objects
  //   location
  //     Location model

  if (typeof rawEntries !== 'object') {
    throw new Error('Missing or invalid rawEntries array');
  }

  // Init

  var self = this;
  emitter(self);

  // State
  var _entryModels = rawEntries.map(function (rawEntry) {
    return new EntryModel(rawEntry, self);
  });

  // Private methods

  var _createEntry = function (rawEntry) {
    // Most recent is topmost
    rawEntries.unshift(rawEntry);
    _entryModels.unshift(new EntryModel(rawEntry, self));
  };

  var _removeEntry = function (id) {
    // Remove locally a raw entry with the given id.

    // Find index
    var i, index;
    index = -1;
    for (i = 0; i < rawEntries.length; i += 1) {
      if (rawEntries[i]._id === id) {
        index = i;
        break;
      }
    }

    // Already removed if not found, thus return
    if (index === -1) {
      return;
    }

    // Remove in place
    rawEntries.splice(index, 1);
    _entryModels.splice(index, 1);
  };

  // Bind

  location.on('location_entry_event', function (ev) {

    if (ev.type.endsWith('entry_created')) {
      _createEntry(rawEventToRawEntry(ev));
      // E.g. self.emit('location_entry_created', ev);
      self.emit(ev.type, ev);
    }

    if (ev.type.endsWith('entry_removed')) {
      var en = _removeEntry(ev.data.entryId);
      // E.g. self.emit('location_entry_removed', ev, en);
      self.emit(ev.type, ev, en);
    }

    if (ev.type.endsWith('entry_changed')) {
      // E.g. self.emit('location_entry_changed', ev);
      self.emit(ev.type, ev);
    }

    if (ev.type.endsWith('comment_created') ||
        ev.type.endsWith('comment_changed') ||
        ev.type.endsWith('comment_removed')) {
      // E.g. self.emit('location_entry_comment_created', ev);
      self.emit(ev.type, ev);
    }
  });

  // Public methods

  self.getEntry = function (entryId) {
    // Return
    //   Entry model or null if not found.
    var i;
    for (i = 0; i < _entryModels.length; i += 1) {
      if (_entryModels[i].getId() === entryId) {
        return _entryModels[i];
      }
    }
    return null;
  };

  self.getLocation = function () {
    // Return location model
    return location;
  };

  self.toArray = function () {
    // Get Entry models as array, ordered by time, most recent first.
    return _entryModels;
  };
};
