/* global describe, it, beforeEach, before, after */
/* eslint-disable handle-callback-err */

var db = require('../../../services/db');
var local = require('../../../../config/local');
var loadFixture = require('../../../../migration/lib/loadFixture');
var fixture = require('./dal.spec.fixture');
var unit = require('./index');
var assert = require('assert');

describe('server.api.markers.dal', function () {

  before(function (done) {
    db.init(local.mongo.testUrl, function (err) {
      if (err) {
        return console.error('Failed to connect to MongoDB.');
      }

      return done();
    });
  });

  after(function (done) {
    db.close();
    done();
  });

  describe('.getFiltered', function () {

    beforeEach(function (done) {
      loadFixture(fixture, done);
    });

    it('should find non-deleted in az order by default', function (done) {
      unit.getFiltered({}, function (err, locs) {
        assert.equal(locs.length, 2);
        assert.equal(locs[0].name, 'Irbene');
        assert.equal(locs[1].name, 'Mill');
        done();
      });
    });

    it('should be able to find only deleted', function (done) {
      unit.getFiltered({ deleted: true }, function (err, locs) {
        assert.equal(locs.length, 1);
        assert.equal(locs[0].name, 'Kolkos');
        done();
      });
    });

    it('should allow za order', function (done) {
      unit.getFiltered({ order: 'za' }, function (err, locs) {
        assert.equal(locs[1].name, 'Irbene');
        done();
      });
    });

    it('should allow id order', function (done) {
      unit.getFiltered({ order: 'newest' }, function (err, locs) {
        assert.equal(locs[1].name, 'Irbene');  // oldest the last
        done();
      });
    });

    it('should default to newest if rel without text', function (done) {
      unit.getFiltered({ order: 'rel' }, function (err, locs) {
        assert.equal(locs[1].name, 'Irbene');  // oldest the last
        done();
      });
    });

    it('should find by text', function (done) {
      unit.getFiltered({ text: 'johndoe' }, function (err, locs) {
        assert.equal(locs.length, 1);  // only non-deleted
        assert.equal(locs[0].name, 'Mill');
        done();
      });
    });

    it('should allow skipping', function (done) {
      unit.getFiltered({ skip: 1 }, function (err, locs) {
        assert.equal(locs.length, 1);
        assert.equal(locs[0].name, 'Mill');
        done();
      });
    });

    it('should allow limiting', function (done) {
      unit.getFiltered({ limit: 1 }, function (err, locs) {
        assert.equal(locs.length, 1);
        assert.equal(locs[0].name, 'Irbene');
        done();
      });
    });

    it('should throw error on invalid order argument', function () {
      assert.throws(function () {
        unit.getFiltered({ order: 'zs' }, function () {
          assert.fail('should not go here');
        });
      });
    });

  });
});
