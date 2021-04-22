/* eslint-disable new-cap */

const config = require('tresdb-config');
const handlers = require('./handlers');

const jsonParser = require('body-parser').json();

// Token middleware. User can access the routes only with valid token.
// Token contents are stored in req.user.
// See https://github.com/auth0/express-jwt
const jwt = require('express-jwt');
const jwtParser = jwt({
  secret: config.secret,
  algorithms: ['HS256'],
});

const router = require('express').Router();


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
