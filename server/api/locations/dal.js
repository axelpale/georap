/* eslint-disable max-lines */

var db = require('../../services/db');
var shortid = require('shortid');
var eventsDal = require('../events/dal');

exports.addAttachment = function (params, callback) {
  // Parameters:
  //   params
  //     object with properties:
  //       locationId
  //         string
  //       username
  //         string
  //       filePathInUploadDir
  //         string
  //       fileMimeType
  //         string
  //  callback
  //    function (err)

  eventsDal.createLocationAttachmentCreated(params, function (err) {
    if (err) {
      return callback(err);
    }
    return callback(null);
  });
};

exports.addStory = function (params, callback) {
  // Parameters:
  //   params
  //     object with properties:
  //       locationId
  //         string
  //       username
  //         string
  //       markdown
  //         string
  //  callback
  //    function (err)

  eventsDal.createLocationStoryCreated(params, function (err) {
    if (err) {
      return callback(err);
    }
    return callback(null);
  });
};

exports.addVisit = function (params, callback) {
  // Parameters:
  //   params
  //     object with properties:
  //       locationId
  //         string
  //       username
  //         string
  //       year
  //         integer
  //  callback
  //    function (err)

  eventsDal.createLocationVisitCreated(params, function (err) {
    if (err) {
      return callback(err);
    }
    return callback(null);
  });
};

exports.changeGeom = function (params, callback) {
  // Parameters:
  //   params
  //     locationId
  //       ObjectId
  //     username
  //       string
  //     latitude
  //       number
  //     longitude
  //       number

  var locColl = db.get().collection('locations');
  var q = { _id: params.locationId };

  var newGeom = {
    type: 'Point',
    coordinates: [params.longitude, params.latitude],
  };

  var u = { $set: { geom: newGeom } };

  locColl.findOneAndUpdate(q, u, function (err, result) {
    if (err) {
      return callback(err);
    }

    var oldGeom = result.value.geom;

    eventsDal.createLocationGeomChanged({
      locationId: params.locationId,
      username: params.username,
      newGeom: newGeom,
      oldGeom: oldGeom,
    }, function (err2) {
      if (err2) {
        return callback(err2);
      }

      return callback(null);
    });
  });
};

exports.changeName = function (id, newName, username, callback) {

  var locColl = db.get().collection('locations');
  var q = { _id: id };
  var u = { $set: { name: newName } };

  locColl.findOneAndUpdate(q, u, function (err, result) {
    if (err) {
      return callback(err);
    }

    var oldName = result.value.name;

    eventsDal.createLocationNameChanged({
      locationId: id,
      username: username,
      newName: newName,
      oldName: oldName,
    }, function (err2) {
      if (err2) {
        return callback(err2);
      }

      return callback(null);
    });
  });
};

exports.changeTags = function (params, callback) {
  // Parameters:
  //   params
  //     locationId
  //       ObjectId
  //     username
  //       string
  //     tags
  //       array of strings
  //   callback
  //     function (err)

  var locColl = db.get().collection('locations');
  var q = { _id: params.locationId };
  var newTags = params.tags;
  var u = { $set: { tags: newTags } };

  locColl.findOneAndUpdate(q, u, function (err, result) {
    if (err) {
      return callback(err);
    }

    var oldTags = result.value.tags;

    eventsDal.createLocationTagsChanged({
      locationId: params.locationId,
      username: params.username,
      newTags: newTags,
      oldTags: oldTags,
    }, function (err2) {
      if (err2) {
        return callback(err2);
      }

      return callback(null);
    });
  });
};

exports.count = function (callback) {
  // Count non-deleted locations
  //
  // Parameters:
  //   callback
  //     function (err, number)

  var coll = db.get().collection('locations');

  coll.count({ deleted: false }).then(function (number) {
    return callback(null, number);
  }).catch(function (err) {
    return callback(err);
  });
};

exports.create = function (lat, lng, username, callback) {
  // Create a location to given coordinates.

  var now = (new Date()).toISOString();

  var newLoc = {
    content: [{
      _id: shortid.generate(),
      type: 'created',
      user: username,
      time: now,
      data: {
        lat: lat,
        lng: lng,
      },
    }],
    deleted: false,
    geom: {
      type: 'Point',
      coordinates: [lng, lat],
    },
    layer: 1,
    name: '',
    tags: [],
  };

  var coll = db.get().collection('locations');

  coll.insertOne(newLoc, function (err, result) {
    if (err) {
      return callback(err);
    }

    var id = result.insertedId;
    newLoc._id = id;

    eventsDal.createLocationCreated({
      locationId: id,
      lat: lat,
      lng: lng,
      username: username,
    }, function (err2) {
      if (err2) {
        return callback(err2);
      }
      return callback(null, newLoc);
    });
  });
};

exports.removeOne = function (id, username, callback) {
  // Remove single location
  //
  // Parameters:
  //   id
  //     ObjectId
  //   username
  //     string
  //   callback
  //     function (err)
  //

  var coll = db.get().collection('locations');

  var q = { _id: id };
  var u = { $set: { deleted: true } };

  coll.findOneAndUpdate(q, u, function (err, result) {
    if (err) {
      return callback(err);
    }

    eventsDal.createLocationRemoved({
      locationId: id,
      locationName: result.value.name,
      username: username,
    }, callback);
  });
};

exports.getOne = function (id, callback) {
  // Get single location
  //
  // Parameters:
  //   id
  //     ObjectId
  //   callback
  //     function (err, loc)
  //       err null and loc null if no loc found
  //

  var coll = db.get().collection('locations');

  coll.findOne({ _id: id }, {}, function (err, doc) {
    if (err) {
      return callback(err);
    }

    if (!doc) {
      return callback(null, null);
    }

    return callback(null, doc);
  });
};
