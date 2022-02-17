var request = require('../lib/request');

module.exports = function (id, newName, callback) {
  // Gives new name to the location and saves the change it to server.
  //
  // Parameters
  //   newName
  //     string
  //   callback
  //     function (err)
  //
  return request.postJSON({
    url: '/api/locations/' + id + '/name',
    data: { newName: newName },
  }, callback);
};
