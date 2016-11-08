/* global describe, it, beforeEach */
/* eslint-disable object-property-newline */

var local = require('../../config/local');
var fixture = require('./fixtures/small');
var tools = require('../../specs/tools');
var errors = require('../errors');
var unit = require('./locations');

var assert = require('assert');
var jwt = require('jsonwebtoken');
var monk = require('monk');
var ObjectId = require('mongodb').ObjectId;

var db = monk(local.mongo.testUrl);

var TESTER_USER = 'tester';
var TESTER_EMAIL = 'tester@example.com';

var goodToken = jwt.sign({
  name: TESTER_USER,
  email: TESTER_EMAIL,
}, local.secret);
var badToken = jwt.sign({
  name: TESTER_USER,
  email: TESTER_EMAIL,
}, 'badsecret');

describe('server.handlers.locations', function () {

  beforeEach(function (done) {
    tools.loadFixture(db, fixture, done);
  });

  describe('addOne', function () {

    it('should add one successfully', function (done) {
      var data = {
        token: goodToken,
        geom: { type: 'Point', coordinates: [0, 0] },
      };

      unit.addOne(db, data, function (response) {
        assert.ok(response.hasOwnProperty('success'), response.error);
        assert.deepEqual(response.success.geom.coordinates, [0, 0]);
        done();
      });
    });

    it('should detect bad token', function (done) {
      var data = {
        token: badToken,
        geom: { type: 'Point', coordinates: [0, 0] },
      };

      unit.addOne(db, data, function (response) {
        assert.strictEqual(response, errors.responses.InvalidTokenError);
        done();
      });
    });
  });

  describe('getOne', function () {

    it('should return single location when found', function (done) {
      var id = '581f166110a1482dd0b7cd13';
      var data = { token: goodToken, locationId: id };

      unit.getOne(db, data, function (response) {
        assert.ok(response.hasOwnProperty('success'));
        assert.ok(response.success._id.equals(new ObjectId(id)));
        done();
      });
    });

    it('should return NotFoundError when not found', function (done) {
      var id = '2222222110a1482dd0b7cd13';
      var data = { token: goodToken, locationId: id };

      unit.getOne(db, data, function (response) {
        assert.strictEqual(response, errors.responses.NotFoundError);
        done();
      });
    });

    it('should detect invalid ObjectId', function (done) {
      var id = 'foobar';
      var data = { token: goodToken, locationId: id };

      unit.getOne(db, data, function (response) {
        assert.strictEqual(response, errors.responses.InvalidRequestError);
        done();
      });
    });
  });

  describe('rename', function () {

    it('should rename', function (done) {
      var id = '581f166110a1482dd0b7cd13';
      var newName = 'Ghost Town';
      var data = {
        token: goodToken,
        locationId: id,
        newName: newName,
      };

      unit.rename(db, data, function (response) {
        assert.equal(response.success.name, newName);
        done();
      });
    });

    it('should detect unknown location', function (done) {
      var id = '2222222110a1482dd0b7cd13';
      var data = {
        token: goodToken,
        locationId: id,
        newName: 'Ghost Town',
      };

      unit.rename(db, data, function (response) {
        assert.strictEqual(response, errors.responses.NotFoundError);
        done();
      });
    });

    it('should detect invalid ObjectId', function (done) {
      var id = 'foobar';
      var data = {
        token: goodToken,
        locationId: id,
        newName: 'Ghost Town',
      };

      unit.rename(db, data, function (response) {
        assert.strictEqual(response, errors.responses.InvalidRequestError);
        done();
      });
    });
  });
});
