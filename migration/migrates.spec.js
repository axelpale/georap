/* global describe, it, beforeEach, before, after */
/* eslint-disable no-magic-numbers */

var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var local = require('../config/local');
var migrates = require('./migrates');
var schema = require('./lib/schema');
var fixtures = require('./fixtures');
var tools = require('../specs/tools');

var loadFixture = function (db, versionTag, callback) {
  // Load fixture into the database.
  //
  // Parameters:
  //   versionTag
  //     e.g. 'v2'
  //   callback
  //     function (err)
  //

  if (!fixtures.hasOwnProperty(versionTag)) {
    throw new Error('invalid version tag:' + versionTag);
  }

  tools.loadFixture(db, fixtures[versionTag], callback);
};


describe('migrates.migrate', function () {
  var db;

  before(function (done) {
    mongoClient.connect(local.mongo.testUrl, function (dbErr, dbConn) {
      if (dbErr) {
        return console.error('Failed to connect to MongoDB.');
      }
      db = dbConn;

      return done();
    });
  });

  after(function (done) {
    db.close();
    done();
  });

  describe('v1 to v2', function () {

    beforeEach(function (done) {
      loadFixture(db, 'v1', done);
    });

    it('should be able to migrate from v1 to v2', function (done) {
      migrates.migrate({
        db: db,
        targetVersion: 2,
        callback: function (err) {
          assert.ifError(err);

          schema.getVersion(db.collection('config'), function (err2, vers) {
            assert.ifError(err2);
            assert.equal(vers, 2);
            done();
          });
        },
      });
    });

  });


  describe('v2 to v3', function () {

    beforeEach(function (done) {
      loadFixture(db, 'v2', done);
    });

    it('should be able to migrate from v2 to v3', function (done) {
      migrates.migrate({
        db: db,
        targetVersion: 3,
        callback: function (err) {
          assert.ifError(err);

          schema.getVersion(db.collection('config'), function (err2, vers) {
            assert.ifError(err2);
            assert.equal(vers, 3);
            done();
          });
        },
      });
    });

  });


  describe('v3 to v4', function () {

    beforeEach(function (done) {
      loadFixture(db, 'v3', done);
    });

    it('should be able to migrate from v3 to v4', function (done) {
      migrates.migrate({
        db: db,
        targetVersion: 4,
        callback: function (err) {
          assert.ifError(err);

          schema.getVersion(db.collection('config'), function (err2, vers) {
            assert.ifError(err2);
            assert.equal(vers, 4);
            done();
          });
        },
      });
    });

  });


});
