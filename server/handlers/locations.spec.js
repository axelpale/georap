/* global describe, it, beforeEach, before, after */
/* eslint-disable object-property-newline */

var local = require('../../config/local');
var fixture = require('./fixtures/small');
var tools = require('../../specs/tools');
var errors = require('../errors');
var unit = require('./locations');

var assert = require('assert');
var jwt = require('jsonwebtoken');
var clone = require('clone');

var mongoClient = require('mongodb').MongoClient;

var TESTER_USER = 'tester';
var TESTER_EMAIL = 'tester@example.com';



// Test input literals. They are given into the tests as input parameters.

var goodToken = jwt.sign({
  name: TESTER_USER,
  email: TESTER_EMAIL,
}, local.secret);

var badToken = jwt.sign({
  name: TESTER_USER,
  email: TESTER_EMAIL,
}, 'badsecret');

var goodLocation = clone(fixture.collections.locations[0]);
goodLocation._id = goodLocation._id.toString();  // stringify id

var goodNewLocation = clone(goodLocation);
delete goodNewLocation._id;  // new locations do not have id

var badLocation = clone(goodLocation);
badLocation.name = 2;  // invalid name

// END Test input literals


describe('server.handlers.locations', function () {
  var db;

  before(function (done) {
    mongoClient.connect(local.mongo.testUrl, function (dbErr, dbConn) {
      if (dbErr) {
        return console.error('Failed to connect to MongoDB.');
      }
      db = dbConn;

      return done();
    });
  });

  after(function (done) {
    db.close();
    done();
  });

  beforeEach(function (done) {
    tools.loadFixture(db, fixture, done);
  });

  describe('put', function () {

    it('should create one successfully', function (done) {
      var data = {
        token: goodToken,
        location: goodNewLocation,
      };

      unit.put(db, data, function (response) {
        assert.ok(response.hasOwnProperty('success'), response.error);
        assert.deepEqual(response.success.geom.coordinates,
                         goodNewLocation.geom.coordinates);
        done();
      });
    });

    it('should rename', function (done) {

      var renamedLocation = clone(goodLocation);
      renamedLocation.name = 'Ghost Town';

      var data = {
        token: goodToken,
        location: renamedLocation,
      };

      unit.put(db, data, function (response) {
        if (response.error) {
          console.error(response.error);
        }
        assert.ok(response.success);
        assert.equal(response.success.name, 'Ghost Town');
        done();
      });
    });

    it('should detect bad token', function (done) {
      var data = {
        token: badToken,
        location: goodNewLocation,
      };

      unit.put(db, data, function (response) {
        assert.strictEqual(response, errors.responses.InvalidTokenError);
        done();
      });
    });

  });



  describe('get', function () {

    it('should return single location if found', function (done) {
      var id = '581f166110a1482dd0b7cd13';
      var data = { token: goodToken, location: { '_id': id } };

      unit.get(db, data, function (result) {
        assert.ok(result.hasOwnProperty('success'));
        assert.ok(result.success._id.equals(id));  // Tests id serialization
        done();
      });
    });

    it('should return NotFoundError when not found', function (done) {
      var id = '2222222110a1482dd0b7cd13';
      var data = { token: goodToken, location: { '_id': id } };

      unit.get(db, data, function (response) {
        assert.strictEqual(response, errors.responses.NotFoundError);
        done();
      });
    });

    it('should detect invalid location id', function (done) {
      var id = 'foobar';
      var data = { token: goodToken, location: { '_id': id } };

      unit.get(db, data, function (response) {
        assert.strictEqual(response, errors.responses.InvalidRequestError);
        done();
      });
    });

  });



  describe('del', function () {

    it('should delete single location if found', function (done) {
      var id = '581f166110a1482dd0b7cd13';
      var dataForDel = { token: goodToken, location: { '_id': id } };
      var dataForCount = { token: goodToken };

      unit.del(db, dataForDel, function (result) {
        assert.ok(result.hasOwnProperty('success'));
        // Ensure that the deleted loc is given as the result.
        assert.equal(result.success.name, 'Irbene');
        // Ensure the doc was removed.
        unit.count(db, dataForCount, function (result2) {
          if (result2.error) {
            console.error(result2);
          }
          assert.equal(result2.success, 0);
          done();
        });
      });
    });

    it('should return NotFoundError when not found', function (done) {
      var id = '2222222110a1482dd0f00b42';
      var data = { token: goodToken, location: { '_id': id } };

      unit.del(db, data, function (result) {
        assert.strictEqual(result, errors.responses.NotFoundError);
        done();
      });
    });

    it('should detect invalid location id', function (done) {
      var id = 'foobar';
      var data = { token: goodToken, location: { '_id': id } };

      unit.del(db, data, function (result) {
        assert.strictEqual(result, errors.responses.InvalidRequestError);
        done();
      });
    });

  });

});  // Top describe
