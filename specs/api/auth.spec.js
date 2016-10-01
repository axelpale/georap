/* global describe, context, it, before, after */

// eslint-disable-next-line no-unused-vars
var should = require('should');
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

  describe('auth/login should response with', function () {

    context('JWT token when', function () {
      it('known email and password are provided', function (done) {
        var payload = {
          email: local.admin.email,
          password: local.admin.password,
        };

        socket.emit('auth/login', payload, function (res) {
          res.should.have.property('token');
          done();
        });
      });
    });

    context('InvalidRequestError when', function () {

      var assertIRE = function (payload, done) {
        socket.emit('auth/login', payload, function (res) {
          res.should.have.property('error', 'InvalidRequestError');
          done();
        });
      };

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

});
