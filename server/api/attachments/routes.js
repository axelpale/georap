// Attachment collection

const router = require('express').Router(); // eslint-disable-line new-cap
const jsonParser = require('body-parser').json();

const handlers = require('./handlers');
const attachmentLoader = require('./lib/attachmentLoader');
const attachmentRouter = require('./attachment/routes');

// TEMP Scaffold
router.use((req, res, next) => {
  req.user = {
    name: 'foobar',
    email: 'foobar@example.com',
    admin: true,
  };
  return next();
});

router.get('/', jsonParser, handlers.getAll); // TODO Bug? JSON parser w/ GET?
router.post('/', jsonParser, handlers.create);
router.get('/count', handlers.count);
router.use('/:attachmentKey', attachmentLoader, attachmentRouter);

module.exports = router;
