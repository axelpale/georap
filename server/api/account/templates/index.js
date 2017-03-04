var fs = require('fs');
var path = require('path');
var ejs = require('ejs');

exports.resetMailTemplate = (function () {
  var p = path.resolve(__dirname, './resetEmail.ejs');
  var f = fs.readFileSync(p, 'utf8');  // eslint-disable-line no-sync

  return ejs.compile(f);
}());

exports.inviteMailTemplate = (function () {
  var p = path.resolve(__dirname, './inviteEmail.ejs');
  var f = fs.readFileSync(p, 'utf8');  // eslint-disable-line no-sync

  return ejs.compile(f);
}());
