/* eslint-disable max-lines */

var db = require('../../../services/db');
var eventsDal = require('../../events/dal');

exports.changeGeom = function (params, callback) {
  // Parameters:
  //   params
  //     locationId
  //       ObjectId
  //     locationName
  //       string
  //     locationGeom
  //       GeoJSON Point
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

  locColl.updateOne(q, u, function (err) {
    if (err) {
      return callback(err);
    }

    var oldGeom = params.locationGeom;

    eventsDal.createLocationGeomChanged({
      locationId: params.locationId,
      locationName: params.locationName,
      username: params.username,
      newGeom: newGeom,
      oldGeom: oldGeom,
    }, function (err2) {
      if (err2) {
        return callback(err2);
      }

      return callback();
    });
  });
};

exports.changeName = function (params, callback) {
  // Parameters
  //   params
  //     locationId
  //     locationName
  //     newName
  //     username
  //

  var locColl = db.get().collection('locations');

  var q = { _id: params.locationId };
  var u = { $set: { name: params.newName } };

  locColl.updateOne(q, u, function (err) {
    if (err) {
      return callback(err);
    }

    var oldName = params.locationName;

    eventsDal.createLocationNameChanged({
      locationId: params.locationId,
      locationName: params.locationName,
      username: params.username,
      newName: params.newName,
      oldName: oldName,
    }, function (err2) {
      if (err2) {
        return callback(err2);
      }

      return callback();
    });
  });
};

exports.changeTags = function (params, callback) {
  // Parameters:
  //   params
  //     locationId
  //     locationName
  //     locationTags
  //       array, old tags
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

  locColl.updateOne(q, u, function (err) {
    if (err) {
      return callback(err);
    }

    var oldTags = params.locationTags;

    eventsDal.createLocationTagsChanged({
      locationId: params.locationId,
      locationName: params.locationName,
      username: params.username,
      newTags: newTags,
      oldTags: oldTags,
    }, function (err2) {
      if (err2) {
        return callback(err2);
      }

      return callback();
    });
  });
};

exports.getRaw = function (id, callback) {
  // Get single location without events and entries
  //
  // Parameters:
  //   id
  //     ObjectId
  //   callback
  //     function (err, loc)
  //       err null and loc null if no loc found
  //

  var locColl = db.get().collection('locations');

  locColl.findOne({ _id: id }, {}, function (err, doc) {
    if (err) {
      return callback(err);
    }

    if (!doc) {
      return callback(null, null);
    }

    return callback(null, doc);
  });
};

exports.getOne = function (id, callback) {
  // Get single location with events and entries
  //
  // Parameters:
  //   id
  //     ObjectId
  //   callback
  //     function (err, loc)
  //       err null and loc null if no loc found
  //

  var locColl = db.get().collection('locations');
  var evColl = db.get().collection('events');
  var enColl = db.get().collection('entries');

  locColl.findOne({ _id: id }, {}, function (err, doc) {
    if (err) {
      return callback(err);
    }

    if (!doc) {
      return callback(null, null);
    }

    var q = { locationId: id };
    var opt = { sort: { time: -1 } };
    evColl.find(q, opt).toArray(function (err2, docs) {
      if (err2) {
        return callback(err2);
      }

      doc.events = docs;

      enColl.find(q, opt).toArray(function (err3, docs2) {
        if (err3) {
          return callback(err3);
        }

        doc.entries = docs2;

        return callback(null, doc);
      });
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
      location: result.value,
      username: username,
    }, callback);
  });
};
