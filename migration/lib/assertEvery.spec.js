/* eslint-disable no-magic-numbers */
const test = require('tape');
const assertEvery = require('./assertEvery');
const config = require('georap-config');
const db = require('tresdb-db');
const loadFixture = require('./loadFixture');
const dropCollections = require('./dropCollections');

// Ensure we are in test mode before loading fixture
if (config.env !== 'test') {
  throw new Error('Tests not allowed in NODE_ENV ' + config.env);
}

const before = (fixture, done) => {
  db.init(config.mongo.testUrl, (err) => {
    if (err) {
      return done(err);
    }
    // As a first step, drop all test db collections in case they
    // have dirt after a bug or so.
    dropCollections(db, (errdrop) => {
      if (errdrop) {
        return done(errdrop);
      }

      loadFixture(fixture, (errfix) => {
        if (errfix) {
          return done(errfix);
        }

        return done();
      });
    });
  });
};

test.onFinish(() => {
  // As a final step, reset the test database for future tests.
  return dropCollections(db, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    // Then, close and exit.
    db.close();
  });
});

test('assertEvery happy', (t) => {
  const fixture = {
    collections: {
      docs: [
        { key: true },
        { key: true },
        { key: true },
      ],
    },
  };

  before(fixture, (berr) => {
    t.error(berr);
    assertEvery('docs', (doc, next) => {
      next(null, doc.key);
    }, (err, result) => {
      t.error(err, 'no errors');
      t.equal(result.ok, true, 'result.ok');
      t.equal(result.numValid, 3, 'numValid');
      t.equal(result.numDocuments, 3, 'numDocuments');
      t.end();
    });
  });
});

test('assertEvery short', (t) => {
  const fixture = {
    collections: {
      docs: [
        { key: true },
        { key: false },
        { key: true },
      ],
    },
  };

  before(fixture, (berr) => {
    t.error(berr);
    assertEvery('docs', (doc, next) => {
      next(null, doc.key);
    }, (err, result) => {
      t.error(err, 'no errors');
      t.equal(result.ok, false, 'result.ok');
      t.equal(result.numValid, 1, 'numValid');
      t.equal(result.numDocuments, 3, 'numDocuments');
      t.end();
    });
  });
});
