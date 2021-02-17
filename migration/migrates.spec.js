/* eslint-disable no-magic-numbers, max-lines */
/* global describe, it, beforeEach, before, after */

var db = require('tresdb-db');
var assert = require('assert');

var config = require('tresdb-config');
var migrates = require('./migrates');
var schema = require('./lib/schema');
var assertFixtureEqual = require('./lib/assertFixtureEqual');
var dropCollections = require('./lib/dropCollections');
var fixtures = require('./fixtures');
var loadFixture = require('./lib/loadFixture');
var fse = require('fs-extra');
var path = require('path');

var loadFixtureByTag = function (versionTag, callback) {
  // Load fixture into the database.
  //
  // Parameters:
  //   versionTag
  //     e.g. 'v2'
  //   callback
  //     function (err)
  //

  if (!fixtures[versionTag]) {
    throw new Error('invalid version tag:' + versionTag);
  }

  loadFixture(fixtures[versionTag], callback);
};


describe('migrates.migrate', function () {

  before(function (done) {
    db.init(config.mongo.testUrl, function (err) {
      if (err) {
        return done(err);
      }
      // As a first step, drop all test db collections in case they
      // have dirt after a bug or so.
      return dropCollections(db, done);
    });
  });

  after(function (done) {
    // As a final step, reset the test database for future tests.
    return dropCollections(db, (err) => {
      if (err) {
        return done(err);
      }

      // Then, close and exit.
      db.close();
      done();
    });
  });

  describe('v1 to v2', function () {

    beforeEach(function (done) {
      loadFixtureByTag('v1', done);
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
      loadFixtureByTag('v2', done);
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
      loadFixtureByTag('v3', done);
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
      loadFixtureByTag('v4', done);
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
      loadFixtureByTag('v5', done);
    });

    it('should be able to migrate from v5 to v6', function (done) {
      var targetV = 6;

      // Upload attachment temporarily.
      var from = path.join(__dirname, 'fixtures', 'uploads', 'radar.jpg');
      var to = path.join(config.uploadDir, '2009', 'RxRvKSlbl', 'radar.jpg');
      // eslint-disable-next-line no-sync
      fse.copySync(from, to);

      // Upload attachment thumbnail.
      var from2 = path.join(__dirname, 'fixtures', 'uploads',
                            'radar_medium.jpg');
      var to2 = path.join(config.uploadDir, '2009', 'RxRvKSlbl',
                          'radar_medium.jpg');
      // eslint-disable-next-line no-sync
      fse.copySync(from2, to2);

      migrates.migrate(targetV, function (err) {
        assert.ifError(err);

        assertFixtureEqual('config', 'v6', function (err2) {
          assert.ifError(err2);

          assertFixtureEqual('users', 'v6', function (err3) {
            assert.ifError(err3);

            assertFixtureEqual('locations', 'v6', function (err4) {
              assert.ifError(err4);

              assertFixtureEqual('entries', 'v6', function (err5) {
                assert.ifError(err5);

                assertFixtureEqual('events', 'v6', function (err6) {
                  assert.ifError(err6);
                  // NOTE we decided not to remove the uploaded files
                  // because the complexity in removing the empty directories.
                  done();
                });
              });
            });
          });
        });
      });
    });

  });

  describe('v6 to v7', function () {

    beforeEach(function (done) {
      loadFixtureByTag('v6', done);
    });

    it('should be able to migrate from v6 to v7', function (done) {
      var targetV = 7;
      migrates.migrate(targetV, function (err) {
        assert.ifError(err);

        assertFixtureEqual('config', 'v7', function (err2) {
          assert.ifError(err2);

          assertFixtureEqual('locations', 'v7', function (err4) {
            assert.ifError(err4);

            done();
          });
        });
      });
    });

  });

  describe('v7 to v8', function () {

    beforeEach(function (done) {
      loadFixtureByTag('v7', done);
    });

    it('should be able to migrate from v7 to v8', function (done) {
      var targetV = 8;
      migrates.migrate(targetV, function (err) {
        assert.ifError(err);

        assertFixtureEqual('config', 'v8', function (err2) {
          assert.ifError(err2);

          assertFixtureEqual('users', 'v8', function (err4) {
            assert.ifError(err4);

            done();
          });
        });
      });
    });

  });

  describe('v8 to v9', function () {
    beforeEach(function (done) {
      loadFixtureByTag('v8', done);
    });

    it('should be able to migrate from v8 to v9', function (done) {
      var targetV = 9;
      migrates.migrate(targetV, function (err) {
        assert.ifError(err);

        assertFixtureEqual('config', 'v9', function (err2) {
          assert.ifError(err2);

          assertFixtureEqual('locations', 'v9', function (err4) {
            assert.ifError(err4);

            assertFixtureEqual('events', 'v9', function (err5) {
              assert.ifError(err5);

              done();
            });
          });
        });
      });
    });
  });

  describe('v9 to v10', function () {
    beforeEach(function (done) {
      loadFixtureByTag('v9', done);
    });

    it('should be able to migrate from v9 to v10', function (done) {
      var targetV = 10;
      migrates.migrate(targetV, function (err) {
        assert.ifError(err);

        assertFixtureEqual('config', 'v10', function (err2) {
          assert.ifError(err2);

          assertFixtureEqual('locations', 'v10', function (err4) {
            assert.ifError(err4);

            done();
          });
        });
      });
    });
  });

  describe('v10 to v11', function () {
    beforeEach(function (done) {
      loadFixtureByTag('v10', done);
    });

    it('should be able to migrate from v10 to v11', function (done) {
      var targetV = 11;
      migrates.migrate(targetV, function (err) {
        assert.ifError(err);

        assertFixtureEqual('config', 'v11', function (err2) {
          assert.ifError(err2);

          // Assert that all users have createdAt and loginAt props
          db.collection('users').find().toArray(function (erra, users) {
            assert.ifError(erra);

            assert.ok(users.length > 0, 'more than 0 users');

            users.forEach(function (u) {
              assert.ok(u.createdAt[0] === '2', 'has createdAt');
              assert.ok(u.loginAt[0] === '2', 'has loginAt');
            });

            done();
          });
        });
      });
    });
  });

  describe('v11 to v12', function () {
    beforeEach(function (done) {
      loadFixtureByTag('v11', done);
    });

    it('should be able to migrate from v11 to v12', function (done) {
      var targetV = 12;
      migrates.migrate(targetV, function (err) {
        assert.ifError(err);
        assertFixtureEqual('config', 'v12', function (err2) {
          assert.ifError(err2);
          assertFixtureEqual('entries', 'v12', function (err3) {
            assert.ifError(err3);
            assertFixtureEqual('events', 'v12', function (err4) {
              assert.ifError(err4);
              done();
            });
          });
        });
      });
    });
  });

});
