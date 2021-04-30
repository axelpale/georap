/* global describe, it, beforeEach, before, after */
/* eslint-disable handle-callback-err */

const db = require('tresdb-db');
const config = require('georap-config');
const loadFixture = require('../../migration/lib/loadFixture');
const assert = require('assert');

const unit = require('../../server/api/markers/dal');
const fixture = require('./markers.spec.fixture');

describe('server.api.markers.dal', () => {

  before((done) => {
    db.init(config.mongo.testUrl, done);
  });

  after((done) => {
    db.close();
    done();
  });

  describe('.getFiltered', () => {

    beforeEach((done) => {
      loadFixture(fixture, done);
    });

    it('should find non-deleted in az order by default', (done) => {
      unit.getFiltered({}, (err, locs) => {
        assert.equal(locs.length, 2);
        assert.equal(locs[0].name, 'Irbene');
        assert.equal(locs[1].name, 'Mill');
        done();
      });
    });

    it('should be able to find only deleted', (done) => {
      unit.getFiltered({ deleted: true }, (err, locs) => {
        assert.equal(locs.length, 1);
        assert.equal(locs[0].name, 'Kolkos');
        done();
      });
    });

    it('should allow za order', (done) => {
      unit.getFiltered({ order: 'za' }, (err, locs) => {
        assert.equal(locs[1].name, 'Irbene');
        done();
      });
    });

    it('should allow id order', (done) => {
      unit.getFiltered({ order: 'newest' }, (err, locs) => {
        assert.equal(locs[1].name, 'Irbene');  // oldest the last
        done();
      });
    });

    it('should default to newest if rel without text', (done) => {
      unit.getFiltered({ order: 'rel' }, (err, locs) => {
        assert.equal(locs[1].name, 'Irbene');  // oldest the last
        done();
      });
    });

    it('should find by text', (done) => {
      unit.getFiltered({ text: 'johndoe' }, (err, locs) => {
        assert.equal(locs.length, 1);  // only non-deleted
        assert.equal(locs[0].name, 'Mill');
        done();
      });
    });

    it('should allow skipping', (done) => {
      unit.getFiltered({ skip: 1 }, (err, locs) => {
        assert.equal(locs.length, 1);
        assert.equal(locs[0].name, 'Mill');
        done();
      });
    });

    it('should allow limiting', (done) => {
      unit.getFiltered({ limit: 1 }, (err, locs) => {
        assert.equal(locs.length, 1);
        assert.equal(locs[0].name, 'Irbene');
        done();
      });
    });

    it('should throw error on invalid order argument', () => {
      assert.throws(() => {
        unit.getFiltered({ order: 'zs' }, () => {
          assert.fail('should not go here');
        });
      });
    });

  });
});
