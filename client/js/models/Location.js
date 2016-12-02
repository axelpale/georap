
var Story = require('./Story');

var shortid = require('shortid');
var Emitter = require('component-emitter');

module.exports = function (loc, api, auth) {

  Emitter(this);
  var self = this;


  // Init

  // Sort content, newest first, create-event to bottom.
  loc.content.sort(function comp(a, b) {
    if (a.time < b.time) {
      return 1;
    }
    if (a.time > b.time) {
      return -1;
    }
    if (a.type === 'created') {
      return 1;
    }
    return 0;
  });


  // Private methods

  var createEntry = function (type, data) {
    var entryId, entry;

    // Find unique id for entry.
    do {
      entryId = shortid.generate();
    } while (loc.content.hasOwnProperty(entryId));

    entry = {
      _id: entryId,
      type: type,
      user: auth.getUser().name,
      time: (new Date()).toISOString(),
      data: data,
    };

    loc.content.unshift(entry);
    self.emit('content_changed');

    return entry;
  };


  // Public methods

  this.getId = function () {
    return loc._id;
  };

  this.setName = function (newName) {
    loc.name = newName;
    this.emit('name_changed');
  };

  this.getEntry = function (entryId) {
    // Return
    //   Content entry model or null if not found.
    var raw;

    if (!loc.content.hasOwnProperty(entryId)) {
      return null;
    }

    raw = loc.content[entryId];

    switch (raw.type) {
    case 'story':
      return new Story(raw, this);
    default:
      throw new Error('unknown entry type');
    }
  };

  this.getEntries = function () {
    // Return content entry models as an array.
    var k, entry, entries;

    entries = [];

    for (k in loc.content) {
      if (loc.content.hasOwnProperty(k)) {
        entry = this.getEntry(k);
        if (entry) {
          entries.push(entry);
        }
      }
    }

    return entries;
  };

  this.createStory = function (markdown) {

    if (typeof markdown !== 'string') {
      throw new Error('invalid story markdown type: ' + (typeof markdown));
    }

    var rawEntry = createEntry('story', { markdown: markdown.trim() });

    return new Story(rawEntry, this);
  };

  this.createAttachment = function () {

  };

  this.createVisit = function () {

  };

  this.save = function (callback) {
    api.request('locations/update', { location: loc }, callback);
  };

  this.remove = function (callback) {
    api.request('locations/remove', { locationId: loc._id }, callback);
  };
};
