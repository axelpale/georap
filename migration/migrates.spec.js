/* eslint-disable max-lines */
/* global describe, it, beforeEach, before, after */

const db = require('georap-db');
const assert = require('assert');

const config = require('georap-config');
const migrates = require('./migrates');
const schemaVersion = require('./lib/schema');
const schemas = require('./schemas');
const assertEvery = require('./lib/assertEvery');
const assertFixtureEqual = require('./lib/assertFixtureEqual');
const dropCollections = require('./lib/dropCollections');
const fixtures = require('./fixtures');
const loadFixture = require('./lib/loadFixture');
const fse = require('fs-extra');
const path = require('path');
const Ajv = require('ajv');
const ajv = new Ajv();

const loadFixtureByTag = function (versionTag, callback) {
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

describe('fixtures', () => {
  describe('example', () => {
    it('should follow schema', (done) => {
      const schema = schemas.v12;
      const fixture = fixtures.example;
      const isValid = ajv.validate(schema, fixture);
      if (!isValid) {
        console.log(ajv.errors);
      }
      assert.ok(isValid);
      return done();
    });
  });

  describe('v12', () => {
    it('should follow schema', (done) => {
      const schema = schemas.v12;
      const fixture = fixtures.v12;
      const isValid = ajv.validate(schema, fixture);
      if (!isValid) {
        console.log(ajv.errors);
      }
      assert.ok(isValid);
      return done();
    });
  });
});

describe('migrates.migrate', () => {

  before((done) => {
    db.init(config.mongo.testUrl, (err) => {
      if (err) {
        return done(err);
      }
      // As a first step, drop all test db collections in case they
      // have dirt after a bug or so.
      return dropCollections(db, done);
    });
  });

  after((done) => {
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

  describe('v1 to v2', () => {

    beforeEach((done) => {
      loadFixtureByTag('v1', done);
    });

    it('should be able to migrate from v1 to v2', (done) => {
      const targetV = 2;
      migrates.migrate(targetV, (err) => {
        assert.ifError(err);

        schemaVersion.getVersion((err2, vers) => {
          assert.ifError(err2);
          assert.equal(vers, targetV);
          done();
        });
      });
    });

  });


  describe('v2 to v3', () => {

    beforeEach((done) => {
      loadFixtureByTag('v2', done);
    });

    it('should be able to migrate from v2 to v3', (done) => {
      const targetV = 3;
      migrates.migrate(targetV, (err) => {
        assert.ifError(err);

        schemaVersion.getVersion((err2, vers) => {
          assert.ifError(err2);
          assert.equal(vers, targetV);
          done();
        });
      });
    });

  });


  describe('v3 to v4', () => {

    beforeEach((done) => {
      loadFixtureByTag('v3', done);
    });

    it('should be able to migrate from v3 to v4', (done) => {
      const targetV = 4;
      migrates.migrate(targetV, (err) => {
        assert.ifError(err);

        schemaVersion.getVersion((err2, vers) => {
          assert.ifError(err2);
          assert.equal(vers, targetV);
          done();
        });
      });
    });

  });

  describe('v4 to v5', () => {

    beforeEach((done) => {
      loadFixtureByTag('v4', done);
    });

    it('should be able to migrate from v4 to v5', (done) => {
      const targetV = 5;
      migrates.migrate(targetV, (err) => {
        assert.ifError(err);

        assertFixtureEqual('config', 'v5', (err2) => {
          assert.ifError(err2);

          assertFixtureEqual('locations', 'v5', (err3) => {
            assert.ifError(err3);
            done();
          });
        });
      });
    });

  });


  describe('v5 to v6', () => {

    beforeEach((done) => {
      loadFixtureByTag('v5', done);
    });

    it('should be able to migrate from v5 to v6', (done) => {
      const targetV = 6;

      // Upload attachment temporarily.
      const from = path.join(__dirname, 'fixtures', 'uploads', 'radar.jpg');
      const to = path.join(config.uploadDir, '2009', 'RxRvKSlbl', 'radar.jpg');
      // eslint-disable-next-line no-sync
      fse.copySync(from, to);

      // Upload attachment thumbnail.
      const from2 = path.join(__dirname, 'fixtures', 'uploads',
                              'radar_medium.jpg');
      const to2 = path.join(config.uploadDir, '2009', 'RxRvKSlbl',
                            'radar_medium.jpg');
      // eslint-disable-next-line no-sync
      fse.copySync(from2, to2);

      migrates.migrate(targetV, (err) => {
        assert.ifError(err);

        assertFixtureEqual('config', 'v6', (err2) => {
          assert.ifError(err2);

          assertFixtureEqual('users', 'v6', (err3) => {
            assert.ifError(err3);

            assertFixtureEqual('locations', 'v6', (err4) => {
              assert.ifError(err4);

              assertFixtureEqual('entries', 'v6', (err5) => {
                assert.ifError(err5);

                assertFixtureEqual('events', 'v6', (err6) => {
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

  describe('v6 to v7', () => {

    beforeEach((done) => {
      loadFixtureByTag('v6', done);
    });

    it('should be able to migrate from v6 to v7', (done) => {
      const targetV = 7;
      migrates.migrate(targetV, (err) => {
        assert.ifError(err);

        assertFixtureEqual('config', 'v7', (err2) => {
          assert.ifError(err2);

          assertFixtureEqual('locations', 'v7', (err4) => {
            assert.ifError(err4);

            done();
          });
        });
      });
    });

  });

  describe('v7 to v8', () => {

    beforeEach((done) => {
      loadFixtureByTag('v7', done);
    });

    it('should be able to migrate from v7 to v8', (done) => {
      const targetV = 8;
      migrates.migrate(targetV, (err) => {
        assert.ifError(err);

        assertFixtureEqual('config', 'v8', (err2) => {
          assert.ifError(err2);

          assertFixtureEqual('users', 'v8', (err4) => {
            assert.ifError(err4);

            done();
          });
        });
      });
    });

  });

  describe('v8 to v9', () => {
    beforeEach((done) => {
      loadFixtureByTag('v8', done);
    });

    it('should be able to migrate from v8 to v9', (done) => {
      const targetV = 9;
      migrates.migrate(targetV, (err) => {
        assert.ifError(err);

        assertFixtureEqual('config', 'v9', (err2) => {
          assert.ifError(err2);

          assertFixtureEqual('locations', 'v9', (err4) => {
            assert.ifError(err4);

            assertFixtureEqual('events', 'v9', (err5) => {
              assert.ifError(err5);

              done();
            });
          });
        });
      });
    });
  });

  describe('v9 to v10', () => {
    beforeEach((done) => {
      loadFixtureByTag('v9', done);
    });

    it('should be able to migrate from v9 to v10', (done) => {
      const targetV = 10;
      migrates.migrate(targetV, (err) => {
        assert.ifError(err);

        assertFixtureEqual('config', 'v10', (err2) => {
          assert.ifError(err2);

          assertFixtureEqual('locations', 'v10', (err4) => {
            assert.ifError(err4);

            done();
          });
        });
      });
    });
  });

  describe('v10 to v11', () => {
    beforeEach((done) => {
      loadFixtureByTag('v10', done);
    });

    it('should be able to migrate from v10 to v11', (done) => {
      const targetV = 11;
      migrates.migrate(targetV, (err) => {
        assert.ifError(err);

        assertFixtureEqual('config', 'v11', (err2) => {
          assert.ifError(err2);

          // Assert that all users have createdAt and loginAt props
          db.collection('users').find().toArray((erra, users) => {
            assert.ifError(erra);

            assert.ok(users.length > 0, 'more than 0 users');

            users.forEach((u) => {
              assert.ok(u.createdAt[0] === '2', 'has createdAt');
              assert.ok(u.loginAt[0] === '2', 'has loginAt');
            });

            done();
          });
        });
      });
    });
  });

  describe('v11 to v12', () => {
    beforeEach((done) => {
      loadFixtureByTag('v11', done);
    });

    it('should be able to migrate from v11 to v12', (done) => {
      const targetV = 12;
      migrates.migrate(targetV, (err) => {
        assert.ifError(err);
        assertFixtureEqual('config', 'v12', (err2) => {
          assert.ifError(err2);
          assertFixtureEqual('entries', 'v12', (err3) => {
            assert.ifError(err3);
            assertFixtureEqual('events', 'v12', (err4) => {
              assert.ifError(err4);
              // Ensure location have createdAt and thumbnail
              assertEvery('locations', (loc, then) => {
                return then(
                  null,
                  typeof loc.createdAt === 'string' &&
                  typeof loc.thumbnail === 'object' // null is an object
                );
              }, (err5) => {
                assert.ifError(err5);
                done();
              });
            });
          });
        });
      });
    });
  });

});
