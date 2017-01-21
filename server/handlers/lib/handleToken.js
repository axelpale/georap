var local = require('../../../config/local');
var errors = require('../../errors');

var jwt = require('jsonwebtoken');

module.exports = function (token, response, onSuccess) {
  // Parameters:
  //   token
  //     string
  //   response
  //     Socket.io response. Will be called on error.
  //   onSuccess
  //     function (tokenPayload). Will be called on success.

  if (typeof token !== 'string') {
    return response(errors.responses.InvalidRequestError);
  }

  jwt.verify(token, local.secret, function (err, payload) {
    if (err) {
      return response(errors.responses.InvalidTokenError);
    }

    if (typeof payload.name !== 'string') {
      return response(errors.responses.InvalidTokenError);
    }

    return onSuccess(payload);
  });
};
