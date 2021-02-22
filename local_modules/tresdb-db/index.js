// Singleton wrapper around mongodb with
// some handy server-side functions.

const config = require('tresdb-config')
const mongodb = require('mongodb')
const mongoClient = mongodb.MongoClient
const ObjectId = mongodb.ObjectId

let dbClient = null

exports.INDICES = require('./indices')

exports.id = (k) => {
  return new ObjectId(k)
}

exports.timestamp = () => {
  return (new Date()).toISOString()
}

exports.init = (mongoUrl, callback) => {
  // Usage:
  //   db.init(function (err) {
  //     if (err) ...
  //     db.get().collection('mydocs').find()...
  //   });
  //
  // Parameters:
  //   mongoUrl
  //     optional connection url. If not given, config.env is used to determine
  //     which url to use.
  //   callback
  //     function (err)

  if (dbClient !== null) {
    return callback()
  }

  if (typeof mongoUrl === 'function') {
    callback = mongoUrl

    if (config.env === 'test') {
      mongoUrl = config.mongo.testUrl
    } else {
      mongoUrl = config.mongo.url
    }
  }

  // Test url can be undefined or null to signal that no test db is set.
  if (!mongoUrl) {
    let msg = 'Database is not configured. Stopping...'
    if (config.env === 'test') {
      msg = 'Test database is not configured. Skipping tests...'
    }
    return callback(new Error(msg))
  }

  const mongoOpts = {
    // Use new server discovery and monitoring engine
    // instead of the deprecated one. Becomes the default in the future.
    useUnifiedTopology: true
  }

  if (config.env === 'test') {
    // Detect stopped database quickly when just testing.
    mongoOpts.serverSelectionTimeoutMS = 500
  }

  mongoClient.connect(mongoUrl, mongoOpts, (dbErr, connectedClient) => {
    if (dbErr) {
      return callback(dbErr)
    }

    dbClient = connectedClient
    return callback()
  })
}

exports.get = () => {
  // Return
  //   connected mongodb database instance

  if (dbClient !== null) {
    return dbClient.db()
  }

  throw new Error('db.init must be called and finished before db.get')
}

exports.collection = (collName) => {
  // Return
  //   a MongoDB collection instance

  if (dbClient !== null) {
    return dbClient.db().collection(collName)
  }

  throw new Error('db.init must be called and finished before db.collection')
}

exports.close = () => {
  if (dbClient !== null) {
    dbClient.close()
    dbClient = null
  }
}
