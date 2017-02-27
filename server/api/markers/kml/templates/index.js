var fs = require('fs');
var path = require('path');
var ejs = require('ejs');

exports.standalone = (function () {
  var p = path.resolve(__dirname, './standalone.ejs');
  var f = fs.readFileSync(p, 'utf8');  // eslint-disable-line no-sync

  return ejs.compile(f);
}());

exports.network = (function () {
  var p = path.resolve(__dirname, './network.ejs');
  var f = fs.readFileSync(p, 'utf8');  // eslint-disable-line no-sync

  return ejs.compile(f);
}());
