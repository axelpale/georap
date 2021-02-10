// Attachment collection

const router = require('express').Router(); // eslint-disable-line new-cap
const jsonParser = require('body-parser').json();

const handlers = require('./handlers');
const attachmentLoader = require('./lib/attachmentLoader');
const attachmentRouter = require('./attachment/routes');
const scaffoldRouter = require('./scaffold/routes');

// TEMP Scaffold
router.use((req, res, next) => {
  req.user = {
    name: 'foobar',
    email: 'foobar@example.com',
    admin: true,
  };
  return next();
});

router.get('/', jsonParser, handlers.getMany);
router.post('/', jsonParser, handlers.create);
router.get('/count', handlers.count);
router.use('/scaffold', scaffoldRouter);
router.use('/:attachmentKey', attachmentLoader, attachmentRouter);

module.exports = router;
