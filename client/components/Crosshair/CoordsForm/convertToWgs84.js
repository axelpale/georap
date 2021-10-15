module.exports = function (params, callback) {
  // Parameters
  //   params, object with props
  //     sourceSystem
  //     text
  //   callback
  //     fn (err, latlng), where
  //       latlng
  //         { lat, lng } in WGS84
  //
  return callback(null, {
    lat: 0,
    lng: 0,
  });
};
