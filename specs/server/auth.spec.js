/* global describe, context, it, before, after */

var local = require('../../config/local');
// eslint-disable-next-line no-unused-vars
var should = require('should');
var jwt = require('jsonwebtoken');
var io = require('socket.io-client');
var monk = require('monk');
var bcrypt = require('bcryptjs');

var db = monk(local.mongo.testUrl);


// Set up test fixtures

var ADMIN_USER = 'admin';
var ADMIN_EMAIL = 'admin@example.com';
var ADMIN_PASSWORD = 'admin_password';

var TESTER_USER = 'tester';
var TESTER_EMAIL = 'tester@example.com';
var TESTER_PASSWORD = 'tester_password';

var fixture = {
  users: [
    {
      name: ADMIN_USER,
      email: ADMIN_EMAIL,
      hash: bcrypt.hashSync(ADMIN_PASSWORD, local.bcrypt.rounds),
      admin: true,
    },
    {
      name: TESTER_USER,
      email: TESTER_EMAIL,
      hash: bcrypt.hashSync(TESTER_PASSWORD, local.bcrypt.rounds),
      admin: false,
    },
  ],
};


describe('TresDB Socket.io API', function () {
  var socket;

  before(function (done) {
    socket = io('http://localhost:' + local.port);
    socket.on('connect', done);
  });

  after(function () {
    socket.disconnect();
  });

  beforeEach(function (done) {
    // Drop possibly existing collections
    var users = db.get('users');
    users.drop().then(function () {

      // Populate with test users
      users.insert(fixture.users).then(function () {
        done();
      }).catch(done);

    }).catch(done);
  });

  var createResponseAssert = function (ev, key, val) {
    // Return an assertion function that emits the given event and tests
    // that the response has correct key and value string.
    // Value is optional parameter.
    //
    // The returned function takes payload, and done-callback as its params.
    //
    // Usage:
    //   var he = createResponseAssert('auth/login', 'error', 'HashingError');
    //   ...
    //   it('should response with HashingError', function (done) {
    //     he({ pay: load, that: causes, hashing: error }, done);
    //   });
    //
    return function assertion(payload, done) {
      socket.emit(ev, payload, function (res) {
        if (typeof val === 'undefined') {
          res.should.have.property(key);
        } else {
          res.should.have.property(key, val);
        }
        done();
      });
    };
  };

  describe('auth/login should response with', function () {


    context('JWT token when', function () {

      var assertToken = createResponseAssert('auth/login', 'token');

      it('known email and password are provided', function (done) {
        assertToken({
          email: TESTER_EMAIL,
          password: TESTER_PASSWORD,
        }, done);
      });
    });

    context('InvalidRequestError when', function () {

      var assertIRE = createResponseAssert('auth/login', 'error',
                                           'InvalidRequestError');

      it('an empty payload is provided', function (done) {
        assertIRE({}, done);
      });

      it('a valid email is provided without password', function (done) {
        assertIRE({ email: TESTER_EMAIL }, done);
      });

      it('an unknown email is provided without password', function (done) {
        assertIRE({ email: 'foo@bar.com' }, done);
      });

      it('an object is injected as email', function (done) {
        assertIRE({
          email: {
            foo: 'bar',
          },
          password: 'foobar',
        }, done);
      });

      it('a malformed email is given', function (done) {
        // Client should ensure correctly formatted email address.
        assertIRE({
          email: 'foo@bar',
          password: 'foobar',
        }, done);
      });

      it('an empty password is given', function (done) {
        assertIRE({
          email: 'foo@bar.com',
          password: '',
        }, done);
      });

    });

    context('UnknownEmailError when', function () {
      it('a unknown but correctly formatted email is given', function (done) {
        var payload = {
          email: 'foo@bar.com',
          password: 'foobar',
        };

        socket.emit('auth/login', payload, function (res) {
          res.should.have.property('error', 'UnknownEmailError');
          done();
        });
      });
    });

    context('IncorrectPasswordError when', function () {
      it('a wrong pwd is given with known email', function (done) {
        var payload = {
          email: TESTER_EMAIL,
          password: 'foobar',
        };

        socket.emit('auth/login', payload, function (res) {
          res.should.have.property('error', 'IncorrectPasswordError');
          done();
        });
      });
    });
  });

  describe('auth/changePassword should response with', function () {

    var goodToken = jwt.sign({ email: TESTER_EMAIL }, local.secret);
    var badEmailToken = jwt.sign({ email: 'foo123@bar.com' }, local.secret);
    var badToken1 = jwt.sign({ foo: 'bar' }, local.secret);
    var badToken2 = jwt.sign({ email: TESTER_EMAIL }, 'foo');

    context('InvalidRequestError when', function () {
      var assertIRE = createResponseAssert('auth/changePassword', 'error',
                                           'InvalidRequestError');

      it('no token is provided', function (done) {
        assertIRE({}, done);
      });

      it('the token has signed but unexpected content', function (done) {
        assertIRE({ token: badToken1 }, done);
      });

      it('the token is signed with unknown key', function (done) {
        assertIRE({ token: badToken2 }, done);
      });

      it('no current password is provided', function (done) {
        assertIRE({ token: goodToken }, done);
      });
    });

    context('UnknownEmailError when', function () {
      var assertUEE = createResponseAssert('auth/changePassword', 'error',
                                           'UnknownEmailError');

      it('unknown email is provided', function (done) {
        assertUEE({
          token: badEmailToken,
          currentPassword: TESTER_PASSWORD,
          newPassword: TESTER_PASSWORD,
        }, done);
      });

    });

    context('IncorrectPasswordError when', function () {
      var assertIPE = createResponseAssert('auth/changePassword', 'error',
                                           'IncorrectPasswordError');

      it('the current password is incorrect', function (done) {
        assertIPE({
          token: goodToken,
          currentPassword: 'foo',
          newPassword: 'bar',
        }, done);
      });
    });

    context('success when', function () {
      var assertSuccess = createResponseAssert('auth/changePassword', 'success',
                                               true);

      it('token ok, passwords match', function (done) {
        assertSuccess({
          token: goodToken,
          currentPassword: TESTER_PASSWORD,
          newPassword: TESTER_PASSWORD,
        }, done);
      });
    });
  });

});
