
var geostamp = require('../lib/geostamp');
var timestamp = require('../../lib/timestamp');
var template = require('./Move.ejs');

module.exports = function (entry) {

  // Private methods


  // Public methods

  this.render = function () {
    return template({
      entry: entry,
      timestamp: timestamp,
      oldGeomHtml: geostamp(entry.getOldGeom(), { precision: 5 }),
      newGeomHtml: geostamp(entry.getNewGeom(), { precision: 5 }),
    });
  };

  this.bind = function () {
    // noop
  };

  this.unbind = function () {
    // noop
  };

};
