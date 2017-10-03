
var local = require('../../../../config/local');
var markersDal = require('../dal');
var templates = require('./templates');
var status = require('http-status-codes');
var slugify = require('slugify');


var getPrettyNow = function () {
  // For example:
  //   YYYY-MM-DDTHH:mm:ss.sssZ -> YYYY-MM-DD-HH-MM
  var l = 16;
  var d = new Date();
  var s = d.toISOString();  // YYYY-MM-DDTHH:mm:ss.sssZ
  var ss = s.substr(0, l);  // YYYY-MM-DDTHH:mm
  var sss = ss.replace('T', '-').replace(':', '-');  // YYYY-MM-DD-HH-mm
  return sss;
};

exports.getKML = function (req, res) {
  // Stand-alone KML

  markersDal.getAll(function (err, docs) {
    if (err) {
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    // Convert to KML XML
    var xml = templates.standalone({
      siteTitle: local.title,
      markers: docs,
    });

    // Name of the file to download
    var filename = slugify(local.title) + '-standalone-' +
                   getPrettyNow() + '.kml';

    // Set headers
    res.set('Content-Type', 'text/xml');
    res.set('Content-Disposition', 'attachment; filename=' + filename);

    return res.send(xml);
  });
};

exports.getNetworkKML = function (req, res) {

  if (typeof req.query.token !== 'string') {
    return res.sendStatus(status.BAD_REQUEST);
  }

  var xml = templates.network({
    siteTitle: local.title,
    token: req.query.token,
  });

  // Name of the file to download
  var filename = slugify(local.title) + '-network-' + getPrettyNow() + '.kml';

  // Set headers
  res.set('Content-Type', 'text/xml');
  res.set('Content-Disposition', 'attachment; filename=' + filename);

  return res.send(xml);
};
