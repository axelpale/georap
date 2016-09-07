
module.exports = function (socket) {

  this.getAll = function (cb) {
    cb(null, [
      {
        id: 23,
        name: 'Kalkkipetteri',
        lat: 60.189287,
        lng: 23.983326
      }
    ]);
  };

  this.getNearest = function (point, limit) {
    // TODO
  };
};
