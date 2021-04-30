const db = require('georap-db');
const eventsDal = require('../../../events/dal');

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

  const locColl = db.collection('locations');

  const q = { _id: params.locationId };
  const newType = params.type;
  const u = { $set: { type: newType } };

  locColl.updateOne(q, u, (err) => {
    if (err) {
      return callback(err);
    }

    const oldType = params.locationType;

    eventsDal.createLocationTypeChanged({
      locationId: params.locationId,
      locationName: params.locationName,
      username: params.username,
      newType: newType,
      oldType: oldType,
    }, (err2) => {
      if (err2) {
        return callback(err2);
      }

      return callback();
    });
  });
};
