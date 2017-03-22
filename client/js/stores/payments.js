var emitter = require('component-emitter');
var account = require('./account');

var getJSON = function (url, callback) {
  $.ajax({
    url: url,
    method: 'GET',
    dataType: 'json',
    headers: { 'Authorization': 'Bearer ' + account.getToken() },
    success: function (result) {
      return callback(null, result);
    },
    error: function (jqxhr, statusCode, statusMessage) {
      return callback(new Error(statusMessage));
    },
  });
};


// Init
emitter(exports);

exports.create = function (callback) {
  return callback(null, {});
};

exports.createCorrection = function (callback) {
  return callback(null, {});
};

exports.getAll = function (callback) {
  return getJSON('/api/payments', callback);
};

exports.getBalances = function (callback) {
  return getJSON('/api/payments/balances', callback);
};
