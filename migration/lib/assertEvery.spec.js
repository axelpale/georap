const test = require('tape');
const assertEvery = require('./assertEvery');
const config = require('georap-config');
const db = require('georap-db');
const loadFixture = require('./loadFixture');
const dropCollections = require('./dropCollections');

// Ensure we are in test mode before loading a fixture
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
    }, (err) => {
      t.error(err, 'no errors');
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
    }, (err) => {
      t.equal(err.name, 'AssertionError', 'error name');
      t.equal(err.numValid, 1, 'numValid');
      t.equal(err.numDocuments, 3, 'numDocuments');
      t.end();
    });
  });
});
