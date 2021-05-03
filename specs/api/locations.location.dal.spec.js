/* global describe, it, beforeEach, before, after */

const db = require('georap-db');
const config = require('georap-config');
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

  });
});
