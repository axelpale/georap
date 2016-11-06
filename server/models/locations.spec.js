/* global describe, it, beforeEach */
/* eslint-disable no-magic-numbers */

var local = require('../../config/local');
var tools = require('../../specs/tools');
var fixtures = require('./fixtures');
var unit = require('./locations');

// var should = require('should');
var assert = require('assert');
var monk = require('monk');

var db = monk(local.mongo.testUrl);


describe('server.models.locations', function () {

  beforeEach(function (done) {
    tools.loadFixture(db, fixtures, done);
  });

  describe('create', function () {

    it('should add one', function (done) {
      unit.create(db, 'admin', {
        type: 'Point',
        coordinates: [0.0, 0.0],
      }, function (err, newloc) {
        if (err) {
          // Because Monk somehow eats thrown errors.
          console.error(err);
        }
        assert.ifError(err);
        assert.strictEqual(newloc.name, '');
        assert.equal(newloc.content[0].user, 'admin');
        assert.strictEqual(newloc.layer, 1);

        unit.count(db, function (err2, num) {
          assert.ifError(err2);
          assert.equal(num, 2);
          done();
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
