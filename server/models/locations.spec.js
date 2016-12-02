/* global describe, it, beforeEach */
/* eslint-disable no-magic-numbers */

var local = require('../../config/local');
var tools = require('../../specs/tools');
var fixture = require('./fixtures/single');
var unit = require('./locations');

var assert = require('assert');
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

    it('should update', function (done) {

      var irbene = fixture.collections.locations[0];
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
      var irbene = fixture.collections.locations[0];
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

  });

  describe('del & get', function () {
    it('should remove', function (done) {
      var irbene = fixture.collections.locations[0];
      unit.del(db, irbene, function (err) {
        if (err) {
          return done(err);
        }
        unit.get(db, irbene, function (err2) {
          assert.equal(err2.name, 'NotFoundError');
          return done();
        });
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
