/* eslint-disable new-cap */

var apiRouter = require('./api/routes');
var clientRouter = require('./client/routes');
var router = require('express').Router();
var status = require('http-status-codes');

router.use('/', clientRouter);
router.use('/api', apiRouter);

// Catch all to 404.
// Must be the final step in the app middleware chain.
router.get('/*', function (req, res) {
  console.log('404 Not Found: ' + req.originalUrl);
  return res.sendStatus(status.NOT_FOUND);
});


module.exports = router;
