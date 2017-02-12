/* eslint-disable max-statements, max-lines */

var extend = require('extend');
var clone = require('clone');
var emitter = require('component-emitter');

var defaultRawLocation = require('./lib/defaultRawLocation');
var validateCoords = require('./lib/validateCoords');
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
  var loc = clone(defaultRawLocation);
  if (typeof rawLoc === 'object') {
    extend(true, loc, rawLoc);
  }

  // Private methods

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

  // var addRawEntry = function (rawEntry) {
  //   // Add raw entry locally to location.
  //   loc.content.push(rawEntry);
  // };

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



  // Public Getters

  this.getAgeInHours = function () {
    // Finds the created event and returns hours between the creation and now.
    // Returns 0 if no such entry;
    var ent = this.getCreatedEntry();

    if (!ent) {
      return 0;
    }

    var MS = 1000;
    var S = 60;
    var M = 60;
    var now = Date.now();
    var backThen = (new Date(ent.time)).getTime();
    var diffMs = now - backThen;
    var diffHours = diffMs / (M * S * MS);

    return diffHours;
  };

  this.getCreator = function () {
    // Return the username of the creator of the location.
    // Return '' if not known.
    var ent = this.getCreatedEntry();

    if (!ent) {
      return '';
    }
    return ent.user;
  };

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

  this.getLongitude = function () {
    return loc.geom.coordinates[0];
  };

  this.getLatitude = function () {
    return loc.geom.coordinates[1];
  };

  this.getEntry = function (entryId) {
    // Return
    //   Content entry model or null if not found.
    if (!hasRawEntry(entryId)) {
      return null;
    }
    return toEntry(getRawEntry(entryId), this);
  };

  this.getCreatedEntry = function () {
    // Returns an entry of 'created' type. Return null if no such entry.
    var i, entry;
    for (i = 0; i < loc.content.length; i += 1) {
      if (loc.content[i].type === 'created') {
        entry = loc.content[i];
        break;
      }
    }

    if (entry) {
      return entry;
    }
    return null;
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
    //     string
    //   callback
    //     function (err)

    if (typeof markdown !== 'string') {
      throw new Error('invalid story markdown type: ' + (typeof markdown));
    }

    $.ajax({
      url: '/api/locations/' + loc._id + '/stories',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        markdown: markdown.trim(),
      }),
      headers: { 'Authorization': 'Bearer ' + account.getToken() },
      success: function () {
        return callback(null);
      },
      error: function (jqxhr, status, err) {
        console.error(err);
        return callback(err);
      },
    });
  };

  this.addAttachment = function (form, callback) {
    // Parameters
    //   form
    //     jQuery instance of the file upload form
    //   callback
    //     function (err)
    //
    // Emits
    //   entry_added, { entryId: <string> }
    //     on successful upload

    var formData = new FormData(form[0]);

    // Attach auth token
    formData.append('token', account.getToken());

    // Send. The contentType must be false, otherwise a Boundary header
    // becomes missing and multer on the server side throws an error about it.
    // The browser will attach the correct headers to the request.
    //
    // Official JWT auth header is used:
    //   Authorization: Bearer mF_9.B5f-4.1JqM
    // For details, see https://tools.ietf.org/html/rfc6750#section-2.1
    $.ajax({
      url: '/api/locations/' + loc._id + '/attachments',
      type: 'POST',
      contentType: false,
      data: formData,
      headers: { 'Authorization': 'Bearer ' + account.getToken() },
      processData: false,
      success: function () {
        return callback(null);
      },
      error: function (jqxhr, status, err) {
        console.log('Upload error');
        console.log(status, err);
        return callback(err);
      },
    });
  };

  this.addVisit = function (year, callback) {
    // Parameters:
    //   year
    //     integer or null if not given
    //   callback
    //     function (err)

    if (typeof year !== 'number') {
      throw new Error('invalid visit year type: ' + (typeof year));
    }

    $.ajax({
      url: '/api/locations/' + loc._id + '/visits',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        year: year,
      }),
      headers: { 'Authorization': 'Bearer ' + account.getToken() },
      success: function () {
        return callback(null);
      },
      error: function (jqxhr, status, err) {
        console.error(err);
        return callback(err);
      },
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

  this.setGeom = function (lng, lat, callback) {
    // Parameters:
    //   lng
    //     number
    //   lat
    //     number
    //   callback
    //     function (err)

    if (!validateCoords.isValidLongitude(lng)) {
      return callback(new Error('Invalid coordinate'));
    }
    if (!validateCoords.isValidLatitude(lat)) {
      return callback(new Error('Invalid coordinate'));
    }

    $.ajax({
      url: '/api/locations/' + loc._id + '/geom',
      method: 'POST',
      data: {
        lat: lat,
        lng: lng,
      },
      headers: { 'Authorization': 'Bearer ' + account.getToken() },
      success: function () {

        // Update coords
        loc.geom.coordinates[0] = lng;
        loc.geom.coordinates[1] = lat;
        self.emit('geom_changed');

        return callback(null);
      },
      error: function (jqxhr, textStatus, errorThrown) {
        return callback(errorThrown);
      },
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

    $.ajax({
      url: '/api/locations/' + loc._id + '/name',
      method: 'POST',
      data: {
        newName: newName,
      },
      headers: { 'Authorization': 'Bearer ' + account.getToken() },
      success: function () {
        loc.name = newName;
        self.emit('name_changed');
        return callback(null);
      },
      error: function (jqxhr, textStatus, errorThrown) {
        return callback(errorThrown);
      },
    });
  };

  this.setTags = function (newTags, callback) {
    // Replaces the current taglist with the new one and saves to server.
    //
    // Parameters
    //   newTags
    //     array of strings
    //   callback
    //     function (err)

    // Validate
    var i, t;
    for (i = 0; i < newTags.length; i += 1) {
      t = newTags[i];
      if (!tags.isValidTag(t)) {
        throw new Error('unknown tag: ' + t);
      }
    }

    // Post
    $.ajax({
      url: '/api/locations/' + loc._id + '/tags',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        tags: newTags,
      }),
      headers: { 'Authorization': 'Bearer ' + account.getToken() },
      success: function () {
        loc.tags = newTags;
        self.emit('tags_changed');
        return callback(null);
      },
      error: function (jqxhr, textStatus, errorThrown) {
        return callback(errorThrown);
      },
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

    $.ajax({
      url: '/api/locations/' + loc._id,
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + account.getToken() },
      success: function () {
        // Inform
        self.emit('removed', self);
        return callback();
      },
      error: function (jqxhr, textStatus, errorThrown) {
        return callback(errorThrown);
      },
    });

  };
};
