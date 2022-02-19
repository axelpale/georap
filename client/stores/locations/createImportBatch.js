var request = require('../lib/request');

module.exports = function (form, callback) {
  // Parameters
  //   form
  //     jQuery instance of the file upload form
  //   callback
  //     function (err)
  //
  return request.postFile({
    url: '/api/locations/import',
    form: form,
  }, callback);
};
