/* eslint-disable new-cap */

const config = require('georap-config');
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


// Public routes

// Authentication
router.post('/', jsonParser, handlers.login);

// Password reset
router.post('/reset/email', jsonParser, handlers.resetPasswordSend);
router.post('/reset', jwtParser, jsonParser, handlers.resetPasswordSave);

// Sign up after invite
router.post('/signup', jwtParser, jsonParser, handlers.inviteSignup);


// User routes - require authentication

// Email change
router.post('/email', jwtParser, jsonParser, handlers.changeEmailSend);
router.post('/email/:code', jwtParser, jsonParser, handlers.changeEmailSave);

// Password change
router.post('/password', jwtParser, jsonParser, handlers.changePassword);


// Admin routes - require authentication with admin privilege

// Send invitation
router.post('/invite', jwtParser, jsonParser, handlers.inviteSend);


module.exports = router;
