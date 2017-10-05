var account = require('../account');

exports.deleteJSON = function (params, callback) {
  // General JSON DELETE AJAX request.
  //
  // Parameters:
  //   params
  //     url
  //     data
  //   callback
  //     function (err, jsonResponse)
  $.ajax({
    url: params.url,
    type: 'DELETE',
    contentType: 'application/json',
    data: JSON.stringify(params.data),
    headers: { 'Authorization': 'Bearer ' + account.getToken() },
    success: function (responseData) {
      return callback(null, responseData);
    },
    error: function (jqxhr, status, statusMessage) {
      return callback(new Error(statusMessage));
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
    error: function (jqxhr, statusCode, statusMessage) {
      return callback(new Error(statusMessage));
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
  //     function (err)

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
    contentType: false,
    data: formData,
    headers: { 'Authorization': 'Bearer ' + account.getToken() },
    processData: false,
    success: function () {
      return callback();
    },
    error: function (jqxhr, statusCode, statusMessage) {
      var err = new Error(jqxhr.statusText);
      err.code = jqxhr.status;

      // eslint-disable-next-line no-magic-numbers
      if (jqxhr.status === 413) {
        err.name = 'REQUEST_TOO_LONG';
      } else {
        err.name = jqxhr.responseText;
      }

      return callback(err);
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
    error: function (jqxhr, status, statusMessage) {
      return callback(new Error(statusMessage));
    },
  });
};
