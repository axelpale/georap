var dal = require('../../../entries/dal');
var status = require('http-status-codes');

exports.create = function (req, res) {
  // HTTP request handler

  var locationId = req.locationId;
  var username = req.user.name;
  var markdown = req.body.markdown;

  if (typeof markdown !== 'string') {
    return res.sendStatus(status.BAD_REQUEST);
  }

  dal.createLocationStory({
    locationId: locationId,
    username: username,
    markdown: markdown,
  }, function (err) {
    if (err) {
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }
    return res.sendStatus(status.OK);
  });
};

exports.change = function (req, res) {

  dal.changeLocationStory({
    entryId: req.entryId,
    locationId: req.locationId,
    newMarkdown: req.body.newMarkdown,
    username: req.user.name,
  }, function (err) {
    if (err) {
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }
    return res.sendStatus(status.OK);
  });
};

exports.remove = function (req, res) {

  dal.removeLocationStory({
    entryId: req.entryId,
    locationId: req.locationId,
    username: req.user.name,
  }, function (err) {
    if (err) {
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }
    return res.sendStatus(status.OK);
  });
};
