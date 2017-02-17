/* eslint-disable max-lines */

var db = require('../../../services/db');
var eventsDal = require('../../events/dal');

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
      locationId: id,
      locationName: result.value.name,
      username: username,
    }, callback);
  });
};
