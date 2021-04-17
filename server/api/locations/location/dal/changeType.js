const db = require('tresdb-db');
const eventsDal = require('../../../../events/dal');

module.exports = function (params, callback) {
  // Parameters:
  //   params
  //     locationId
  //     locationName
  //     locationType
  //       string, old type
  //     username
  //       string
  //     type
  //       string, new type
  //   callback
  //     function (err)

  var locColl = db.collection('locations');

  var q = { _id: params.locationId };
  var newType = params.type;
  var u = { $set: { type: newType } };

  locColl.updateOne(q, u, function (err) {
    if (err) {
      return callback(err);
    }

    var oldType = params.locationType;

    eventsDal.createLocationTypeChanged({
      locationId: params.locationId,
      locationName: params.locationName,
      username: params.username,
      newType: newType,
      oldType: oldType,
    }, function (err2) {
      if (err2) {
        return callback(err2);
      }

      return callback();
    });
  });
};
