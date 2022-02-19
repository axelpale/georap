var template = require('./event.ejs');
var ui = require('georap-ui');
var flagstamp = require('../Post/flagstamp');
var getPoints = require('georap-points');
var config = georap.config;
var locale = georap.i18n.locale;
var __ = georap.i18n.__;

module.exports = function (ev, opts) {
  return template({
    ev: ev,
    timestamp: ui.timestamp(ev.time, locale),
    pointstamp: ui.pointstamp(getPoints(config, ev)),
    flagstamp: flagstamp,
    showThumbnail: opts.showThumbnails ? true : false,
    __: __,
  });
};
