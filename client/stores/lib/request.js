var account = require('../account');

var HTTP_OK = 200;
var HTTP_PAYLOAD_TOO_LARGE = 413;

var createError = function (jqxhr) {
  // Build error object from jQuery ajax http request
  //
  var message;
  var name;
  var status = jqxhr.status;
  if (status === 0) {
    name = 'NO_CONNECTION';
    message = 'No connection';
  } else if (status === HTTP_PAYLOAD_TOO_LARGE) {
    name = 'REQUEST_TOO_LONG';
    message = 'Request payload is too large';
  } else if (status === HTTP_OK) {
    name = jqxhr.statusText;
    message = jqxhr.responseText;
  } else {
    name = jqxhr.statusText;
    message = jqxhr.responseText;
  }

  var err = new Error(message);
  err.name = name;
  err.code = status;

  return err;
};

exports.deleteJSON = function (params, callback) {
  // General JSON DELETE AJAX request.
  //
  // Parameters:
  //   params
  //     url
  //     data
  //   callback
  //     function (err, jsonResponse)
  //
  $.ajax({
    url: params.url,
    type: 'DELETE',
    contentType: 'application/json',
    data: JSON.stringify(params.data),
    headers: { 'Authorization': 'Bearer ' + account.getToken() },
    success: function (responseData) {
      return callback(null, responseData);
    },
    error: function (jqxhr) {
      return callback(createError(jqxhr));
    },
  });
};

exports.getJSON = function (url, callback) {
  $.ajax({
    url: url,
    method: 'GET',
    dataType: 'json',
    headers: { 'Authorization': 'Bearer ' + account.getToken() },
    success: function (result) {
      return callback(null, result);
    },
    error: function (jqxhr) {
      return callback(createError(jqxhr));
    },
  });
};


exports.postFile = function (params, callback) {
  // Send a form with file input.
  //
  // Parameters:
  //   params
  //     url
  //     form
  //       jQuery instance of the file upload form.
  //   callback
  //     function (err, jsonResponse)
  //

  var formData = new FormData(params.form[0]);

  // Send. The contentType must be false, otherwise a Boundary header
  // becomes missing and multer on the server side throws an error about it.
  // The browser will attach the correct headers to the request.
  //
  // Official JWT auth header is used:
  //   Authorization: Bearer mF_9.B5f-4.1JqM
  // For details, see https://tools.ietf.org/html/rfc6750#section-2.1
  $.ajax({
    url: params.url,
    type: 'POST',
    dataType: 'json',  // response data type
    contentType: false,
    data: formData,
    headers: { 'Authorization': 'Bearer ' + account.getToken() },
    processData: false,
    success: function (jsonResp) {
      return callback(null, jsonResp);
    },
    error: function (jqxhr) {
      return callback(createError(jqxhr));
    },
  });
};


exports.postJSON = function (params, callback) {
  // General JSON POST AJAX request.
  //
  // Parameters:
  //   params
  //     url
  //     data
  //   callback
  //     function (err)
  $.ajax({
    url: params.url,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(params.data),
    headers: { 'Authorization': 'Bearer ' + account.getToken() },
    success: function (responseData) {
      return callback(null, responseData);
    },
    error: function (jqxhr) {
      return callback(createError(jqxhr));
    },
  });
};
