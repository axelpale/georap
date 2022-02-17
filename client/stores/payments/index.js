
var request = require('../lib/request');
var emitter = require('component-emitter');


// Init
emitter(exports);

exports.create = function (callback) {
  return callback(null, {});
};

exports.createCorrection = function (callback) {
  return callback(null, {});
};

exports.getAll = function (callback) {
  return request.getJSON({
    url: '/api/payments',
  }, callback);
};

exports.getBalances = function (callback) {
  return request.getJSON({
    url: '/api/payments/balances',
  }, callback);
};
