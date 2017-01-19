var ObjectId = require('mongodb').ObjectId;
var errors = require('../../errors');

module.exports = function (stringId, response, onSuccess) {
  // Validation of an object id that is received from a client.
  //
  // Parameters:
  //   stringId
  //     ObjectId candidate
  //   response
  //     Socket.io response. Will be called on error.
  //   onSuccess
  //     function (objectId). Will be called on success.
  var objId;

  if (typeof stringId !== 'string') {
    return response(errors.responses.InvalidRequestError);
  }

  try {
    objId = new ObjectId(stringId);
  } catch (e) {
    return response(errors.responses.InvalidRequestError);
  }

  return onSuccess(objId);
};
