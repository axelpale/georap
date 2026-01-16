/* eslint-disable new-cap */

const handlers = require('./handlers');
const router = require('express').Router();
const jsonParser = require('body-parser').json();
const able = require('georap-able').able;

router.get('/', handlers.getOne);

router.delete('/', able('admin-users-delete'),
              handlers.removeOne);

router.post('/role', able('admin-users-rerole'),
            jsonParser, handlers.setRole);

module.exports = router;
