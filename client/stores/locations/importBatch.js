var request = require('../lib/request');

module.exports = function (data, callback) {
  // Parameters
  //   data
  //     { batchId: string, indices: Array}
  //   callback
  //     function (err)
  //
  if (!('batchId' in data) || !('indices' in data)) {
    throw new Error('Invalid argument: ' + JSON.stringify(data));
  }

  return request.postJSON({
    url: '/api/locations/import/' + data.batchId,
    data: data,
  }, callback);
};
