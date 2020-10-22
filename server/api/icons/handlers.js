/* eslint-disable no-magic-numbers */
var path = require('path');
var fse = require('fs-extra');
var sharp = require('sharp');
var status = require('http-status-codes');
var config = require('tresdb-config');

var markersBase = path.join(config.staticDir, 'images', 'markers');
var templatesBase = path.join(markersBase, 'templates');
var symbolsBase = path.join(markersBase, 'symbols');

// Ask client to cache the retrieved icon.
var sendFileOptions = {
  maxAge: 60000, // ms
};

// Finds <templateName> and <symbolName>
var iconNamePattern = /^(\w+)-(\w+)-(\w+).png$/;

exports.getOrGenerate = function (req, res, next) {
  var iconName = req.params.iconName;
  var matches = iconNamePattern.exec(iconName);

  if (matches.length !== 4) {
    var msgi = 'No such icon: ' + iconName;
    return res.status(status.NOT_FOUND).send(msgi);
  }

  var templateName = matches[1];
  var childStatus = matches[2];
  var symbolName = matches[3];

  // Target path where to greate the icon.
  var iconPath = path.join(markersBase, iconName);

  // Serve from cache if the icon file already exists.
  fse.pathExists(iconPath, function (errx, iconExists) {
    if (errx) {
      return next(errx);
    }

    if (iconExists) {
      return res.sendFile(iconPath, sendFileOptions, function (errs) {
        if (errs) {
          return next(errs);
        }
      });
    }
    // else generate the icon.

    var templatePath = path.join(templatesBase, templateName + '.png');
    var symbolPath = path.join(symbolsBase, symbolName + '.png');

    fse.pathExists(templatePath, function (errxt, templateExists) {
      if (errxt) {
        return next(errxt);
      }

      if (!templateExists) {
        var msgt = 'No such template for icon: ' + iconName;
        return res.status(status.NOT_FOUND).send(msgt);
      }

      // If empty symbol just copy the template. Assume size sm
      if (symbolName === 'any') {
        fse.copy(templatePath, iconPath, function (errc) {
          if (errc) {
            return next(errc);
          }
          // and send the file.
          return res.sendFile(iconPath, sendFileOptions, next);
        });
        return;
      }

      fse.pathExists(symbolPath, function (errxs, symbolExists) {
        if (errxs) {
          return next(errxs);
        }

        if (!symbolExists) {
          var msgs = 'No such symbol for icon: ' + iconName;
          return res.status(status.NOT_FOUND).send(msgs);
        }

        // Select images to merge.
        var compositeParts = [
          {
            input: symbolPath,
          },
        ];

        // Merge a sub-location
        if (childStatus !== 'none') {
          var childTemplate = config.markerTemplates[childStatus].default.sm;
          var childPath = path.join(templatesBase, childTemplate + '.png');
          compositeParts.push({
            input: childPath,
            gravity: 'southeast',
          });
        }

        sharp(templatePath)
          .composite(compositeParts)
          .png()
          .toFile(iconPath, function (errf) {
            if (errf) {
              return next(errf);
            }

            return res.sendFile(iconPath, sendFileOptions, function (errs) {
              if (errs) {
                return next(errs);
              }
            });
          });
      });
    });
  });
};
