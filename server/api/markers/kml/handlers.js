
const config = require('tresdb-config');
const markersDal = require('../dal');
const templates = require('./templates');
const status = require('http-status-codes');
const slugify = require('slugify');


const getPrettyNow = function () {
  // For example:
  //   YYYY-MM-DDTHH:mm:ss.sssZ -> YYYY-MM-DD-HH-MM
  const l = 16;
  const d = new Date();
  const s = d.toISOString();  // YYYY-MM-DDTHH:mm:ss.sssZ
  const ss = s.substr(0, l);  // YYYY-MM-DDTHH:mm
  const sss = ss.replace('T', '-').replace(':', '-');  // YYYY-MM-DD-HH-mm
  return sss;
};

exports.getKML = function (req, res, next) {
  // Stand-alone KML

  markersDal.getAll((err, docs) => {
    if (err) {
      return next(err);
    }

    // Convert to KML XML
    const xml = templates.standalone({
      siteTitle: config.title,
      markers: docs,
    });

    // Name of the file to download
    const filename = slugify(config.title) + '-standalone-' +
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

  const xml = templates.network({
    siteTitle: config.title,
    token: req.query.token,
  });

  // Name of the file to download
  const filename = slugify(config.title) + '-network-' + getPrettyNow() +
                   '.kml';

  // Set headers
  res.set('Content-Type', 'text/xml');
  res.set('Content-Disposition', 'attachment; filename=' + filename);

  return res.send(xml);
};
