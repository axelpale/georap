// Account
//
// Responsible:
// - authentication login
// - data of the current user
// - account related communication with the server
// - handling auth tokens in browser memory
//
// Not responsible:
// - validation of input values
//
// Emits to bus:
//   login
//   logout
//
var userStore = require('./user');

// Methods for stored token

exports.getEmail = userStore.getEmail;
exports.getName = userStore.getName;
exports.getRole = userStore.getRole;
exports.getAssignableRoles = userStore.getAssignableRoles;
exports.getToken = userStore.getToken;
exports.getUser = userStore.getUser;
exports.hasToken = userStore.hasToken;
exports.setToken = userStore.setToken;
exports.isLoggedIn = userStore.isLoggedIn;
exports.isMe = userStore.isMe;
exports.logout = userStore.logout;
exports.isAble = userStore.isAble;
exports.able = userStore.able;
exports.ableOwn = userStore.ableOwn;
exports.isRoleAble = userStore.isRoleAble;

// HTTP calls

exports.login = require('./login');
exports.changeEmailSendCode = require('./changeEmailSendCode');
exports.changeEmailSave = require('./changeEmailSave');
exports.changePassword = require('./changePassword');
exports.sendResetPasswordEmail = require('./sendResetPasswordEmail');
exports.resetPassword = require('./resetPassword');
exports.sendInviteEmail = require('./sendInviteEmail');
exports.signup = require('./signup');
exports.getFlags = require('./getFlags');
