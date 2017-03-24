// Singleton wrapper around mongodb

var local = require('../../config/local');
var mongoClient = require('mongodb').MongoClient;

var db = null;

exports.init = function (mongoUrl, callback) {
  // Usage:
  //   db.init(function (err) {
  //     if (err) ...
  //     db.get().collection('mydocs').find()...
  //   });
  //
  // Parameters:
  //   mongoUrl
  //     optional connection url. If not given, local.env is used to determine
  //     which url to use.
  //   callback
  //     function (err)

  if (db !== null) {
    return;
  }

  if (typeof mongoUrl === 'function') {
    callback = mongoUrl;

    if (local.env === 'test') {
      mongoUrl = local.mongo.testUrl;
    } else {
      mongoUrl = local.mongo.url;
    }
  }

  // Retry connect to (almost) infinity if the connection is lost.
  // See http://stackoverflow.com/a/39831825/638546
  var mongoOpts = {
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 2000,
  };

  mongoClient.connect(mongoUrl, mongoOpts, function (dbErr, dbConn) {
    if (dbErr) {
      return callback(dbErr);
    }

    db = dbConn;
    return callback();
  });

};

exports.get = function () {
  // Return
  //   connected mongodb instance

  if (db !== null) {
    return db;
  }

  throw new Error('db.init must be called and finished before db.get');
};

exports.collection = function (collName) {
  // Return
  //   a MongoDB collection instance

  if (db !== null) {
    return db.collection(collName);
  }

  throw new Error('db.init must be called and finished before db.collection');
};

exports.close = function () {
  if (db !== null) {
    db.close();
    db = null;
  }
};
