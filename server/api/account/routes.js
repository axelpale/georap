/* eslint-disable new-cap */

const handlers = require('./handlers');
const jsonParser = require('body-parser').json();
const jwtAuth = require('../auth');
const router = require('express').Router();

// Public routes - no login

// Authentication
router.post('/', jsonParser, handlers.login);
// Password reset request
router.post('/reset/email', jsonParser, handlers.resetPasswordSend);

// Temporary routes - temp auth token in url

// Password reset
router.post('/reset', jwtAuth, jsonParser, handlers.resetPasswordSave);
// Sign up after invite
router.post('/signup', jwtAuth, jsonParser, handlers.inviteSignup);

// User routes - require authentication

// Email change
router.post('/email', jwtAuth, jsonParser, handlers.changeEmailSend);
router.post('/email/:code', jwtAuth, jsonParser, handlers.changeEmailSave);
// Password change
router.post('/password', jwtAuth, jsonParser, handlers.changePassword);

// Admin routes - require authentication with admin privilege

// Send invitation
router.post('/invite', jwtAuth, jsonParser, handlers.inviteSend);


module.exports = router;
