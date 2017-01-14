/* eslint-disable max-statements, max-lines */

var shortid = require('shortid');
var extend = require('extend');
var clone = require('clone');
var emitter = require('component-emitter');

var defaultRawLocation = require('./lib/defaultRawLocation');
var sortEntries = require('./lib/sortEntries');
var toEntry = require('./lib/toEntryModel');

module.exports = function (api, account, tags, rawLoc) {
  // Usage:
  //   Update an existing Location:
  //     var l = new Location(api, account, tags, fullLocFromServer);
  //     l.setName('new name');
  //     l.save(function (err) { ... });
  //   Create a new location and send it to server:
  //     var l = new Location(api, account, tags, { geom: geom });
  //     l.save(function (err) { ... });
  //
  // Parameters:
  //   api
  //     a api.Api
  //   account
  //     a models.Account
  //   tags
  //     a models.Tags
  //   rawLoc
  //     Optional location properties that override the default.

  // Init

  emitter(this);
  var self = this;

  // Deep extend the default location.
  var loc = defaultRawLocation;
  if (typeof rawLoc === 'object') {
    extend(true, loc, rawLoc);
  }

  // Private methods

  var addRawTag = function (tag) {
    loc.tags.push(tag);
  };

  var removeRawTag = function (tag) {
    var index = loc.tags.indexOf(tag);
    if (index > -1) {
      loc.tags.splice(index, 1);
    }
  };

  var getRawEntry = function (id) {
    // Return a raw entry with given id
    var i;
    for (i = 0; i < loc.content.length; i += 1) {
      if (loc.content[i]._id === id) {
        return loc.content[i];
      }
    }
    return null;
  };

  var hasRawEntry = function (id) {
    // Return true if an entry with given id exists
    return getRawEntry(id) !== null;
  };

  var addRawEntry = function (rawEntry) {
    // Add raw entry locally to location.
    loc.content.push(rawEntry);
  };

  var removeRawEntry = function (id) {
    // Remove locally a raw entry with the given id.

    // Find index
    var i, index;
    index = -1;
    for (i = 0; i < loc.content.length; i += 1) {
      if (loc.content[i]._id === id) {
        index = i;
        break;
      }
    }

    // Already removed if not found, thus return
    if (index === -1) {
      return;
    }

    // Remove in place
    loc.content.splice(index, 1);
  };

  var createRawEntry = function (type, data) {
    // Constructs a raw entry object. Use addRawEntry to add it to location.
    var entryId, entry;

    // Find unique id for entry.
    do {
      entryId = shortid.generate();
    } while (hasRawEntry(entryId));

    entry = {
      _id: entryId,
      type: type,
      user: account.getUser().name,
      time: (new Date()).toISOString(),
      data: data,
    };

    return entry;
  };



  // Public Getters

  this.getId = function () {
    return loc._id;
  };

  this.getName = function () {
    return loc.name;
  };

  this.getGeom = function () {
    // Return GeoJSON
    return loc.geom;
  };

  this.getEntry = function (entryId) {
    // Return
    //   Content entry model or null if not found.
    if (!hasRawEntry(entryId)) {
      return null;
    }
    return toEntry(getRawEntry(entryId), this);
  };

  this.getEntries = function () {
    // Return content entry models as an array.
    return loc.content.map(function (rawEntry) {
      return toEntry(rawEntry, self);
    });
  };

  this.getEntriesInTimeOrder = function () {
    // Shallow clone the content array
    var tempContent = loc.content.slice(0);
    sortEntries(tempContent);
    return tempContent.map(function (rawEntry) {
      return toEntry(rawEntry, self);
    });
  };

  this.getMarkerLocation = function () {
    return {
      _id: loc._id,
      name: loc.name,
      geom: loc.geom,
      tags: loc.tags,
      layer: loc.layer,
    };
  };

  this.getTags = function () {
    // Return array of strings
    return loc.tags;
  };

  this.hasTag = function (tag) {
    return (loc.tags.indexOf(tag) > -1);
  };


  // Public Mutators

  this.addStory = function (markdown, callback) {
    // Parameters:
    //   markdown
    //   callback
    //     function (err)

    if (typeof markdown !== 'string') {
      throw new Error('invalid story markdown type: ' + (typeof markdown));
    }

    var rawEntry = createRawEntry('story', { markdown: markdown.trim() });
    addRawEntry(rawEntry);

    this.save(function (err) {
      if (err) {
        removeRawEntry(rawEntry._id);
        return callback(err);
      }

      self.emit('entry_added', { entryId: rawEntry._id });
      return callback();
    });
  };

  this.addAttachment = function (callback) {
    return callback(new Error('not implemented'));
  };

  this.addTag = function (tag, callback) {
    // Parameters:
    //   tag
    //     string
    //   callback
    //     function (err)

    if (typeof tag !== 'string') {
      throw new Error('invalid tag type: ' + (typeof tag));
    }

    if (!tags.isValidTag(tag)) {
      throw new Error('unknown tag: ' + tag);
    }

    if (this.hasTag(tag)) {
      // Success, tag already added
      return callback(null);
    }

    addRawTag(tag);

    this.save(function (err) {
      if (err) {
        // Remove the added tag. Other tags could have been added and
        // the tag also removed during the save.
        removeRawTag(tag);

        return callback(err);
      }

      self.emit('tags_changed');
      return callback();
    });
  };

  this.addVisit = function (year, callback) {
    // Parameters:
    //   year
    //     integer or null if not given
    //   callback
    //     function (err)

    if (typeof year !== 'number' || year !== null) {
      throw new Error('invalid visit year type: ' + (typeof year));
    }

    var rawEntry = createRawEntry('visit', { year: year });
    addRawEntry(rawEntry);

    this.save(function (err) {
      if (err) {
        removeRawEntry(rawEntry._id);
        return callback(err);
      }

      self.emit('entry_added', { entryId: rawEntry._id });
      return callback();
    });
  };

  this.removeEntry = function (entryId, callback) {
    // Remove entry from database.
    //
    // Parameters:
    //   entryId
    //   callback
    //     function (err)
    var removedEntry;

    if (hasRawEntry(entryId)) {
      removedEntry = getRawEntry(entryId);
      removeRawEntry(entryId);
      this.save(function (err) {
        if (err) {
          loc.content.push(removedEntry);
          return callback(err);
        }

        self.emit('entry_removed', { entryId: removedEntry._id });
        return callback();
      });
    } else {
      // If already removed
      return callback();
    }
  };

  this.removeTag = function (tag, callback) {

    if (typeof tag !== 'string') {
      throw new Error('invalid tag type: ' + (typeof tag));
    }

    removeRawTag(tag);

    this.save(function (err) {
      if (err) {
        addRawTag(tag);
        return callback(err);
      }

      self.emit('tags_changed');
      return callback();
    });

  };

  this.setName = function (newName, callback) {
    // Gives new name to the location and saves the change it to server.
    //
    // Parameters
    //   newName
    //     string
    //   callback
    //     function (err)

    var oldLoc = clone(loc);
    loc.name = newName;

    var rawEntry = createRawEntry('rename', {
      oldName: oldLoc.name,
      newName: newName,
    });
    addRawEntry(rawEntry);

    this.save(function (err) {
      if (err) {
        // Fallback
        loc = oldLoc;
        return callback(err);
      }
      self.emit('name_changed');
      self.emit('entry_added', { entryId: rawEntry._id });
      return callback();
    });
  };

  this.save = function (callback) {
    // Stores the location to the backend.
    // Used mainly by the location model itself.
    //
    // Parameters:
    //   callback
    //     function (err)
    api.request('locations/put', { location: loc }, function (err, savedLoc) {
      if (err) {
        return callback(err);
      }
      // Store _id. Does nothing if only updated and not created.
      loc._id = savedLoc._id;
      // Inform about the successful update.
      self.emit('saved');
      return callback();
    });
  };

  this.remove = function (callback) {
    var payload = { location: { _id: loc._id } };
    api.request('locations/del', payload, function (err) {
      if (err) {
        return callback(err);
      }
      // Inform
      self.emit('removed');
      return callback();
    });
  };
};
