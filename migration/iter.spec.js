/* global describe, it, beforeEach, afterEach, before, after */

// The Unit
var iter = require('./iter');
var db = require('../server/services/db');
var local = require('../config/local');
// eslint-disable-next-line no-unused-vars
var should = require('should');
var assert = require('assert');


var TEST_COLLECTION_NAME = 'test_collection';


// Test data
var fixture = [
  {
    name: 'Harrison',
  },
  {
    name: 'Barry',
  },
  {
    name: 'Iris',
  },
];

describe('iter.updateEach', function () {
  var collection;

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
    return done();
  });

  beforeEach(function (done) {
    collection = db.collection(TEST_COLLECTION_NAME);
    collection.insertMany(fixture, done);
  });

  afterEach(function (done) {
    collection.drop(done);
  });

  it('should add Dr. prefix', function (done) {
    iter.updateEach(collection, function (person, next) {
      person.name = 'Dr. ' + person.name;
      return next(person);
    }, function (err) {
      assert.ok(!err);

      var q = {
        name: {
          $regex: (/^Dr\./),
        },
      };

      collection.find(q).toArray(function (err2, doctors) {
        if (err2) {
          return done(err2);
        }
        assert.equal(doctors.length, fixture.length);
        return done();
      });
    });
  });

  it('should replace instead of extend', function (done) {
    iter.updateEach(collection, function (person, next) {
      return next({ username: person.name });
    }, function (err) {
      assert.ifError(err);
      collection.find().toArray(function (err2, users) {
        if (err2) {
          return done(err2);
        }
        users[0].should.not.have.ownProperty('name');
        assert.ok(!users[1].hasOwnProperty('name'));
        return done();
      });
    });
  });
});
