const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

exports.standalone = (function () {
  const p = path.resolve(__dirname, './standalone.ejs');
  const f = fs.readFileSync(p, 'utf8');  // eslint-disable-line no-sync

  return ejs.compile(f);
}());

exports.network = (function () {
  const p = path.resolve(__dirname, './network.ejs');
  const f = fs.readFileSync(p, 'utf8');  // eslint-disable-line no-sync

  return ejs.compile(f);
}());
