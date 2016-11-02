/* global describe, it, beforeEach, afterEach */

// eslint-disable-next-line no-unused-vars
var should = require('should');
var assert = require('assert');
var local = require('../../config/local');
var monk = require('monk');

// DB
var db = monk(local.mongo.testUrl);

var TEST_COLLECTION_NAME = 'test_collection';

// The Unit
var iter = require('../lib/iter');

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

  beforeEach(function (done) {
    collection = db.get(TEST_COLLECTION_NAME);
    collection.insert(fixture, done);
  });

  afterEach(function (done) {
    collection.drop(done);
  });

  it('should add Dr. prefix', function (done) {
    iter.updateEach(collection, function (person, next) {
      person.name = 'Dr. ' + person.name;
      next(person);
    }, function (err) {
      assert.ok(!err);
      collection.find({ name: { $regex: (/^Dr\./) } }).then(function (doctors) {
        assert.equal(doctors.length, fixture.length);
        done();
      }).catch(function (err2) {
        done(err2);
      });
    });
  });

  it('should replace instead of extend', function (done) {
    iter.updateEach(collection, function (person, next) {
      next({ username: person.name });
    }, function (err) {
      assert.ifError(err);
      collection.find({}).then(function (users) {
        users[0].should.not.have.ownProperty('name');
        assert.ok(!users[1].hasOwnProperty('name'));
        done();
      });
    });
  });
});
