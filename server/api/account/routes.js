/* eslint-disable new-cap */

const handlers = require('./handlers');
const jsonParser = require('body-parser').json();
const able = require('../able');
const router = require('express').Router();

// Public routes - no login

// Authentication
router.post('/', able('account-login'),
            jsonParser, handlers.login);
// Password reset request
router.post('/reset/email', able('account-password-reset-request'),
            jsonParser, handlers.resetPasswordSend);

// Temporary routes - temp auth token in url

// Password reset
router.post('/reset', able('account-password-reset'),
            jsonParser, handlers.resetPasswordSave);

// Sign up after invite
router.post('/signup', able('account-signup'),
            jsonParser, handlers.inviteSignup);

// User routes - require authentication

// Email change
router.post('/email', able('account-edit'),
            jsonParser, handlers.changeEmailSend);
router.post('/email/:code', able('account-edit'),
            jsonParser, handlers.changeEmailSave);

// Password change
router.post('/password', able('account-edit'),
            jsonParser, handlers.changePassword);

// Admin routes - require authentication with admin privilege

// Send invitation
router.post('/invite', able('account-invite'), jsonParser, handlers.inviteSend);


module.exports = router;
