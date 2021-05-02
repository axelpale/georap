const locationDal = require('../dal');
const status = require('http-status-codes');

module.exports = (req, res, next) => {
  // Update location thumbnail
  //

  // Validate thumbnail key
  const newKey = req.body.attachmentKey;
  if (typeof newKey !== 'string' || newKey.length < 1) {
    return res.status(status.BAD_REQUEST).send('Invalid thumbnail key');
  }

  // If no change, everything ok already
  const oldKey = req.location.thumbnail;
  if (oldKey === newKey) {
    return res.status(status.OK).send('Same thumbnail already selected.');
  }

  locationDal.changeThumbnail({
    username: req.user.name,
    locationId: req.location._id,
    locationName: req.location.name,
    newThumbnail: newKey,
    oldThumbnail: oldKey,
  }, (err) => {
    if (err) {
      return next(err);
    }

    return res.sendStatus(status.OK);
  });
};
