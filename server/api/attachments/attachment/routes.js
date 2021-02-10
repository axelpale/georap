// Attachment collection

const router = require('express').Router(); // eslint-disable-line new-cap
const jsonParser = require('body-parser').json();
const handlers = require('./handlers');
const status = require('http-status-codes');

const onlyOwnerOrAdmin = (req, res, next) => {
  if (req.user.admin === true || req.attachment.user === req.user.name) {
    return next();
  }
  return res.status(status.FORBIDDEN).send('Only for owners and admins.');
};

router.get('/', handlers.get);
router.post('/', onlyOwnerOrAdmin, jsonParser, handlers.rotateImage);
router.delete('/', onlyOwnerOrAdmin, handlers.remove);

module.exports = router;
