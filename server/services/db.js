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

  mongoClient.connect(mongoUrl, function (dbErr, dbConn) {
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

exports.close = function () {
  if (db !== null) {
    db.close();
    db = null;
  }
};
