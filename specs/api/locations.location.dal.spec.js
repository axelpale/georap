/* global describe, it, beforeEach, before, after */

const db = require('tresdb-db');
const config = require('tresdb-config');
const loadFixture = require('../../migration/lib/loadFixture');
const assert = require('assert');

const unit = require('../../server/api/locations/location/dal');
const fixture = require('../../migration/fixtures/example');
const common = require('../../migration/fixtures/common');

describe('server.api.locations.location.dal', () => {

  before((done) => {
    db.init(config.mongo.testUrl, done);
  });

  after((done) => {
    db.close();
    done();
  });

  describe('.getOneComplete', () => {

    beforeEach((done) => {
      loadFixture(fixture, done);
    });

    it('should return null if not found', (done) => {
      unit.getOneComplete(common.missingId, (err, loc) => {
        assert.ifError(err);
        assert.strictEqual(loc, null, 'nil doc');
        done();
      });
    });

    it('should fetch attachments', (done) => {
      unit.getOneComplete(common.irbeneId, (err, loc) => {
        assert.ifError(err);
        assert.equal(loc.entries.length, 2);
        assert.equal(loc.entries[0].attachments.length, 1, 'ensure length');
        assert.equal(
          loc.entries[0].attachments[0].key,
          'ewdsf3s',
          'ensure $lookup'
        );
        done();
      });
    });

  });
});
