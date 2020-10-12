// Singleton wrapper around mongodb

var local = require('../../config/local');
var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectId;

var db = null;

exports.INDICES = [
  {
    collection: 'entries',
    spec: { locationId: 1 },
    options: {},
  },
  {
    collection: 'events',
    spec: { time: 1 },
    options: {},
  },
  {
    collection: 'events',
    spec: { locationId: 1 },
    options: {},
  },
  {
    collection: 'locations',
    spec: { geom: '2dsphere' },
    options: {},
  },
  {
    collection: 'locations',
    spec: { layer: 1 },
    options: {},
  },
  {
    // Text index
    collection: 'locations',
    spec: {
      text1: 'text',  // primary
      text2: 'text',  // secondary
    },
    options: {
      weights: {
        text1: 3,
        text2: 1,
      },
      name: 'TextIndex',
    },
  },
  {
    collection: 'users',
    spec: { email: 1 },
    options: { unique: true },
  },
  {
    collection: 'users',
    spec: { name: 1 },
    options: { unique: true },
  },
];

exports.id = function (k) {
  return new ObjectId(k);
};

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
