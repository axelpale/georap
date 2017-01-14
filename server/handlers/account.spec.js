/* global describe, context, it, before, after, beforeEach */
/* eslint max-lines: 'off' */

var unit = require('./account');

var local = require('../../config/local');
var fixture = require('./fixtures/small');
var tools = require('../../specs/tools');
var MailerMock = require('../../specs/MailerMock');

var assert = require('assert');
var jwt = require('jsonwebtoken');

var mongoClient = require('mongodb').MongoClient;

// User data found in the fixture
var TESTER_EMAIL = 'tester@example.com';
var TESTER_PASSWORD = 'tester_password';

describe('server.handlers.account', function () {
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


  describe('.login', function () {

    it('should response with JWT token', function (done) {
      var payload = {
        email: TESTER_EMAIL,
        password: TESTER_PASSWORD,
      };
      unit.login(db, payload, function (r) {
        assert.ok(typeof r.success === 'string');
        return done();
      });
    });

    context('should response with InvalidRequestError when', function () {

      it('an empty payload is provided', function (done) {
        unit.login(db, {}, function (r) {
          assert.equal(r.error, 'InvalidRequestError');
          return done();
        });
      });

      it('a valid email is provided without password', function (done) {
        unit.login(db, { email: TESTER_EMAIL }, function (r) {
          assert.equal(r.error, 'InvalidRequestError');
          return done();
        });
      });

      it('an unknown email is provided without password', function (done) {
        unit.login(db, { email: 'foo@bar.com' }, function (r) {
          assert.equal(r.error, 'InvalidRequestError');
          return done();
        });
      });

      it('an object is injected as email value', function (done) {
        var payload = {
          email: {
            foo: 'bar',
          },
          password: 'foobar',
        };

        unit.login(db, payload, function (r) {
          assert.equal(r.error, 'InvalidRequestError');
          return done();
        });
      });

      it('a malformed email is given', function (done) {
        // Client should ensure correctly formatted email address.
        var payload = {
          email: 'foo@bar',
          password: 'foobar',
        };

        unit.login(db, payload, function (r) {
          assert.equal(r.error, 'InvalidRequestError');
          return done();
        });
      });

      it('an empty password is given', function (done) {
        var payload = {
          email: 'foo@bar.com',
          password: '',
        };

        unit.login(db, payload, function (r) {
          assert.equal(r.error, 'InvalidRequestError');
          return done();
        });
      });

    });

    context('UnknownEmailError when', function () {
      it('a unknown but correctly formatted email is given', function (done) {
        var payload = {
          email: 'foo@bar.com',
          password: 'foobar',
        };

        unit.login(db, payload, function (r) {
          assert.equal(r.error, 'UnknownEmailError');
          return done();
        });
      });
    });

    context('IncorrectPasswordError when', function () {
      it('a wrong pwd is given with known email', function (done) {
        var payload = {
          email: TESTER_EMAIL,
          password: 'foobar',
        };

        unit.login(db, payload, function (r) {
          assert.equal(r.error, 'IncorrectPasswordError');
          return done();
        });
      });
    });
  });

  describe('.changePassword should response with', function () {

    var goodToken = jwt.sign({ email: TESTER_EMAIL }, local.secret);
    var badEmailToken = jwt.sign({ email: 'foo123@bar.com' }, local.secret);
    var badToken1 = jwt.sign({ foo: 'bar' }, local.secret);
    var badToken2 = jwt.sign({ email: TESTER_EMAIL }, 'foo');

    context('InvalidRequestError when', function () {

      it('no token is provided', function (done) {
        unit.changePassword(db, {}, function (r) {
          assert.equal(r.error, 'InvalidRequestError');
          return done();
        });
      });

      it('the token has signed but unexpected content', function (done) {
        unit.changePassword(db, { token: badToken1 }, function (r) {
          assert.equal(r.error, 'InvalidRequestError');
          return done();
        });
      });

      it('the token is signed with unknown key', function (done) {
        unit.changePassword(db, { token: badToken2 }, function (r) {
          assert.equal(r.error, 'InvalidRequestError');
          return done();
        });
      });

      it('no current password is provided', function (done) {
        unit.changePassword(db, { token: goodToken }, function (r) {
          assert.equal(r.error, 'InvalidRequestError');
          return done();
        });
      });
    });

    context('UnknownEmailError when', function () {

      it('unknown email is provided', function (done) {
        unit.changePassword(db, {
          token: badEmailToken,
          currentPassword: TESTER_PASSWORD,
          newPassword: TESTER_PASSWORD,
        }, function (r) {
          assert.equal(r.error, 'UnknownEmailError');
          return done();
        });
      });

    });

    context('IncorrectPasswordError when', function () {

      it('the current password is incorrect', function (done) {
        unit.changePassword(db, {
          token: goodToken,
          currentPassword: 'foo',
          newPassword: 'bar',
        }, function (r) {
          assert.equal(r.error, 'IncorrectPasswordError');
          return done();
        });
      });
    });

    context('success when', function () {

      it('token ok, passwords match', function (done) {
        unit.changePassword(db, {
          token: goodToken,
          currentPassword: TESTER_PASSWORD,
          newPassword: TESTER_PASSWORD,
        }, function (r) {
          assert.strictEqual(r.success, true);
          return done();
        });
      });
    });

  });

  describe('.sendResetPasswordEmail should response with', function () {
    var mailer;
    var host;

    beforeEach(function (done) {
      mailer = new MailerMock();
      host = 'localhost';
      return done();
    });

    context('InvalidRequestError when', function () {
      it('invalid email is provided', function (done) {
        var payload = {
          email: 'foo@bar',
        };
        unit.sendResetPasswordEmail(db, mailer, host, payload, function (r) {
          assert.equal(r.error, 'InvalidRequestError');
          return done();
        });
      });
    });

    context('UnknownEmailError when', function () {
      it('unknown valid email is provided', function (done) {
        var payload = {
          email: 'foo@bar.com',
        };
        unit.sendResetPasswordEmail(db, mailer, host, payload, function (r) {
          assert.equal(r.error, 'UnknownEmailError');
          return done();
        });
      });
    });

    context('MailServerError when', function () {
      it('mailer gives an error', function (done) {
        var broken = new MailerMock();
        broken.break();

        var payload = {
          email: TESTER_EMAIL,
        };

        unit.sendResetPasswordEmail(db, broken, host, payload, function (r) {
          assert.equal(r.error, 'MailServerError');
          return done();
        });
      });
    });

    context('success when', function () {
      it('known email is provided', function (done) {
        var payload = {
          email: TESTER_EMAIL,
        };

        assert.ok(!mailer.didSendMail());  // test that mock correctly init

        unit.sendResetPasswordEmail(db, mailer, host, payload, function (r) {
          assert.ok(mailer.didSendMail());
          assert.strictEqual(r.success, true);
          return done();
        });
      });
    });

  });

});
