/* global describe, it, before, after, beforeEach */

var local = require('../../config/local');
var migrates = require('../lib/migrates');
var schema = require('../lib/schema');
var backups = require('../lib/backups');

// var should = require('should');
var assert = require('assert');
var path = require('path');
var monk = require('monk');

var db = monk(local.mongo.url);

describe('migrates.migrate', function () {

  before(function (done) {
    // backup the db
    backups.backup(done);
  });

  after(function (done) {
    // restore the db
    backups.restore(done);
  });

  beforeEach(function (done) {
    // restore v1 db
    var vpath = path.resolve(__dirname, 'fixtures/v1');

    backups.restoreFrom(vpath, done);
  });

  it('should be able to migrate from v1 to current', function (done) {
    migrates.migrate(function (err) {
      assert.ifError(err);

      schema.getVersion(db.get('config'), function (err2, vers) {
        assert.ifError(err2);
        assert.equal(vers, schema.getDesiredVersion());
        done();
      });
    });
  });

});
