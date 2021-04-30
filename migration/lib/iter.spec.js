/* global describe, it, beforeEach, afterEach, before, after */

// The Unit
const iter = require('./iter');

const db = require('georap-db');
const config = require('georap-config');
const dropCollections = require('./dropCollections');
// Enable should api
// eslint-disable-next-line no-unused-vars
const should = require('should');
const assert = require('assert');


const TEST_COLLECTION_NAME = 'test_collection';


// Test data
const fixture = [
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

describe('iter.updateEach', () => {
  let collection;

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
    db.close();
    return done();
  });

  beforeEach((done) => {
    collection = db.collection(TEST_COLLECTION_NAME);
    collection.insertMany(fixture, done);
  });

  afterEach((done) => {
    collection.drop(done);
  });

  it('should add Dr. prefix', (done) => {
    iter.updateEach(collection, (person, next) => {
      person.name = 'Dr. ' + person.name;
      return next(null, person);
    }, (err) => {
      assert.ok(!err);

      const q = {
        name: {
          $regex: (/^Dr\./),
        },
      };

      collection.find(q).toArray((err2, doctors) => {
        if (err2) {
          return done(err2);
        }
        assert.equal(doctors.length, fixture.length);
        return done();
      });
    });
  });

  it('should replace instead of extend', (done) => {
    iter.updateEach(collection, (person, next) => {
      return next(null, { username: person.name });
    }, (err) => {
      assert.ifError(err);
      collection.find().toArray((err2, users) => {
        if (err2) {
          return done(err2);
        }
        users[0].should.not.have.ownProperty('name');
        assert.ok(!('name' in users[1]));
        return done();
      });
    });
  });

  it('should detect error', (done) => {
    iter.updateEach(collection, (person, next) => {
      return next(new Error('foobar'));
    }, (err) => {
      assert.equal(err.message, 'foobar');
      return done();
    });
  });

  it('should detect thrown error', (done) => {
    iter.updateEach(collection, () => {
      throw new Error('foobar');
    }, (err) => {
      assert.equal(err.message, 'foobar');
      return done();
    });
  });

  it('should skip nulls', (done) => {
    iter.updateEach(collection, (person, next) => {
      return next(null, null);
    }, (err) => {
      assert.ifError(err);
      return done();
    });
  });
});
