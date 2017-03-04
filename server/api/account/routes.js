/* eslint-disable new-cap */

var local = require('../../../config/local');
var handlers = require('./handlers');

var jsonParser = require('body-parser').json();

// Token middleware. User can access the routes only with valid token.
// Token contents are stored in req.user.
// See https://github.com/auth0/express-jwt
var jwt = require('express-jwt');
var jwtParser = jwt({ secret: local.secret });

var router = require('express').Router();


// Authentication
router.post('/', jsonParser, handlers.login);

// Password reset
router.post('/reset/email', jsonParser, handlers.sendResetPasswordEmail);
router.post('/reset', jwtParser, jsonParser, handlers.resetPassword);

// Change password
router.post('/password', jwtParser, jsonParser, handlers.changePassword);

// Invitation & post-invite sign up
router.post('/invite', jwtParser, jsonParser, handlers.sendInviteEmail);
router.post('/signup', jwtParser, jsonParser, handlers.signup);

module.exports = router;
