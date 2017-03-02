/* global describe, it, beforeEach, before, after */
/* eslint-disable no-magic-numbers */

var db = require('../server/services/db');
var assert = require('assert');

var local = require('../config/local');
var migrates = require('./migrates');
var schema = require('./lib/schema');
var assertFixtureEqual = require('./lib/assertFixtureEqual');
var fixtures = require('./fixtures');
var tools = require('../specs/tools');

var loadFixture = function (versionTag, callback) {
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

  tools.loadFixture(fixtures[versionTag], callback);
};


describe('migrates.migrate', function () {

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

  describe('v1 to v2', function () {

    beforeEach(function (done) {
      loadFixture('v1', done);
    });

    it('should be able to migrate from v1 to v2', function (done) {
      var targetV = 2;
      migrates.migrate(targetV, function (err) {
        assert.ifError(err);

        schema.getVersion(function (err2, vers) {
          assert.ifError(err2);
          assert.equal(vers, targetV);
          done();
        });
      });
    });

  });


  describe('v2 to v3', function () {

    beforeEach(function (done) {
      loadFixture('v2', done);
    });

    it('should be able to migrate from v2 to v3', function (done) {
      var targetV = 3;
      migrates.migrate(targetV, function (err) {
        assert.ifError(err);

        schema.getVersion(function (err2, vers) {
          assert.ifError(err2);
          assert.equal(vers, targetV);
          done();
        });
      });
    });

  });


  describe('v3 to v4', function () {

    beforeEach(function (done) {
      loadFixture('v3', done);
    });

    it('should be able to migrate from v3 to v4', function (done) {
      var targetV = 4;
      migrates.migrate(targetV, function (err) {
        assert.ifError(err);

        schema.getVersion(function (err2, vers) {
          assert.ifError(err2);
          assert.equal(vers, targetV);
          done();
        });
      });
    });

  });

  describe('v4 to v5', function () {

    beforeEach(function (done) {
      loadFixture('v4', done);
    });

    it('should be able to migrate from v4 to v5', function (done) {
      var targetV = 5;
      migrates.migrate(targetV, function (err) {
        assert.ifError(err);

        assertFixtureEqual('config', 'v5', function (err2) {
          assert.ifError(err2);

          assertFixtureEqual('locations', 'v5', function (err3) {
            assert.ifError(err3);
            done();
          });
        });
      });
    });

  });


  describe('v5 to v6', function () {

    beforeEach(function (done) {
      loadFixture('v5', done);
    });

    it('should be able to migrate from v5 to v6', function (done) {
      var targetV = 6;
      migrates.migrate(targetV, function (err) {
        assert.ifError(err);

        assertFixtureEqual('config', 'v6', function (err2) {
          assert.ifError(err2);

          assertFixtureEqual('users', 'v6', function (err3) {
            assert.ifError(err3);

            assertFixtureEqual('locations', 'v6', function (err3) {
              assert.ifError(err3);
              done();
            });
          });
        });
      });
    });

  });


});
