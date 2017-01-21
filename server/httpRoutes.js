var locations = require('./handlers/locations');

module.exports = function (app, db) {

  // Locations

  app.post('/api/locations/:locationId/attachments', function (req, res) {
    return locations.addAttachment(db, req, res);
  });

};
