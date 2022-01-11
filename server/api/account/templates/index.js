const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

exports.resetMailTemplate = (function () {
  const p = path.resolve(__dirname, './resetEmail.ejs');
  const f = fs.readFileSync(p, 'utf8');  // eslint-disable-line no-sync

  return ejs.compile(f);
}());

exports.inviteMailTemplate = (function () {
  const p = path.resolve(__dirname, './inviteEmail.ejs');
  const f = fs.readFileSync(p, 'utf8');  // eslint-disable-line no-sync

  return ejs.compile(f);
}());

exports.changeEmailMailTemplate = (function () {
  const p = path.resolve(__dirname, './changeEmail.ejs');
  const f = fs.readFileSync(p, 'utf8');  // eslint-disable-line no-sync

  return ejs.compile(f);
}());
