/* global describe, it, beforeEach, before, after */
/* eslint-disable no-magic-numbers */

var local = require('../../config/local');
var tools = require('../../specs/tools');
var fixture = require('./fixtures/single');
var unit = require('./locations');

var assert = require('assert');
var clone = require('clone');
var mongoClient = require('mongodb').MongoClient;


describe('server.models.locations', function () {
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

  beforeEach(function (done) {
    tools.loadFixture(db, fixture, done);
  });

  describe('put & get', function () {

    it('should update name', function (done) {

      var irbene = clone(fixture.collections.locations[0]);
      irbene.name = 'Irbene Ghost Town';

      unit.put(db, irbene, function (err, town) {
        if (err) {
          return done(err);
        }
        assert.equal(town.name, 'Irbene Ghost Town');

        unit.get(db, irbene, function (err2, town2) {
          if (err2) {
            return done(err2);
          }
          assert.equal(town2.name, 'Irbene Ghost Town');
          return done();
        });

      });
    });

    it('should create and generate id', function (done) {
      var irbene = clone(fixture.collections.locations[0]);
      var origId = irbene._id;
      delete irbene._id;
      unit.put(db, irbene, function (err, town) {
        if (err) {
          return done(err);
        }
        assert.notEqual(town._id, origId);
        unit.count(db, function (err2, num) {
          if (err2) {
            return done(err2);
          }
          assert.equal(num, 2);
          return done();
        });
      });
    });

    it('should set the layer properly', function (done) {
      var irbene = clone(fixture.collections.locations[0]);
      var originalLayer = irbene.layer;

      // Update the coords. Layer should remain the same.
      irbene.geom.coordinates[0] += 0.00001;

      unit.put(db, irbene, function (err, town) {
        if (err) {
          return done(err);
        }

        assert.equal(town.layer, originalLayer);

        // Insert as a new location. The new location should go below the
        // existing one.
        var layerOfExisting = town.layer;
        delete town._id;

        unit.put(db, town, function (err2, town2) {
          if (err2) {
            return done(err2);
          }
          assert.ok(town2.layer > layerOfExisting);
          return done();
        });
      });
    });

  });

  describe('del & get', function () {
    it('should remove', function (done) {
      var irbene = clone(fixture.collections.locations[0]);
      unit.del(db, irbene, function (err, removedLoc) {
        if (err) {
          return done(err);
        }

        assert.equal(removedLoc.name, fixture.collections.locations[0].name);

        unit.get(db, irbene, function (err2) {
          assert.equal(err2.name, 'NotFoundError');
          return done();
        });
      });
    });

    it('should fail gracefully if not found', function (done) {
      var foo = { _id: '2222222110a1482dd0f00b42' };

      unit.del(db, foo, function (err, removedLoc) {
        assert.equal(err.name, 'NotFoundError');
        assert.ok(!removedLoc);
        return done();
      });
    });
  });

  describe('count', function () {

    it('should be initially right', function (done) {
      unit.count(db, function (err, num) {
        assert.ifError(err);
        assert.strictEqual(num, 1);
        done();
      });
    });

  });

});
