/* global describe, context, it, before, after */

// eslint-disable-next-line no-unused-vars
var should = require('should');
var jwt = require('jsonwebtoken');
var local = require('../../config/local');
var io = require('socket.io-client');


describe('TresDB Socket.io API', function () {
  var socket;

  before(function (done) {
    socket = io('http://localhost:' + local.port);
    socket.on('connect', done);
  });

  after(function () {
    socket.disconnect();
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
          email: local.admin.email,
          password: local.admin.password,
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
        assertIRE({ email: local.admin.email }, done);
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
      it('a wrong is given with known email', function (done) {
        var payload = {
          email: local.admin.email,
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

    var goodToken = jwt.sign({ email: local.admin.email }, local.secret);
    var badEmailToken = jwt.sign({ email: 'foo123@bar.com' }, local.secret);
    var badToken1 = jwt.sign({ foo: 'bar' }, local.secret);
    var badToken2 = jwt.sign({ email: local.admin.email }, 'foo');

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
          currentPassword: local.admin.password,
          newPassword: local.admin.password,
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
          currentPassword: local.admin.password,
          newPassword: local.admin.password,
        }, done);
      });
    });
  });

});
