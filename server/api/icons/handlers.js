/* eslint-disable no-magic-numbers */
const path = require('path');
const fse = require('fs-extra');
const sharp = require('sharp');
const status = require('http-status-codes');
const config = require('tresdb-config');

const markersBase = path.join(config.staticDir, 'images', 'markers');
const templatesBase = path.join(markersBase, 'templates');
const symbolsBase = path.join(markersBase, 'symbols');

// Ask client to cache the retrieved icon.
const sendFileOptions = {
  maxAge: 60000, // ms
};

// Finds <templateName> and <symbolName>
const iconNamePattern = /^(\w+)-(\w+)-(\w+).png$/;

exports.getOrGenerate = function (req, res, next) {
  const iconName = req.params.iconName;
  const matches = iconNamePattern.exec(iconName);

  if (matches.length !== 4) {
    const msgi = 'No such icon: ' + iconName;
    return res.status(status.NOT_FOUND).send(msgi);
  }

  const templateName = matches[1];
  const childStatus = matches[2];
  const symbolName = matches[3];

  // Target path where to greate the icon.
  const iconPath = path.join(markersBase, iconName);

  // Serve from cache if the icon file already exists.
  fse.pathExists(iconPath, (errx, iconExists) => {
    if (errx) {
      return next(errx);
    }

    if (iconExists) {
      return res.sendFile(iconPath, sendFileOptions, (errs) => {
        if (errs) {
          return next(errs);
        }
      });
    }
    // else generate the icon.

    // Analyze the template name better
    const templateParts = templateName.split('_');
    const markerSize = templateParts[2];

    const templatePath = path.join(templatesBase, templateName + '.png');
    const symbolPath = path.join(symbolsBase, symbolName + '.png');

    fse.pathExists(templatePath, (errxt, templateExists) => {
      if (errxt) {
        return next(errxt);
      }

      if (!templateExists) {
        const msgt = 'No such template for icon: ' + iconName;
        return res.status(status.NOT_FOUND).send(msgt);
      }

      // If empty symbol just copy the template. Assume size sm
      if (symbolName === 'any') {
        fse.copy(templatePath, iconPath, (errc) => {
          if (errc) {
            return next(errc);
          }
          // and send the file.
          return res.sendFile(iconPath, sendFileOptions, next);
        });
        return;
      }

      fse.pathExists(symbolPath, (errxs, symbolExists) => {
        if (errxs) {
          return next(errxs);
        }

        if (!symbolExists) {
          const msgs = 'No such symbol for icon: ' + iconName;
          return res.status(status.NOT_FOUND).send(msgs);
        }

        // Select images to merge.
        const compositeParts = [];
        // Position the symbol according to template size
        switch (markerSize) {
          case 'md':
            compositeParts.push({
              input: symbolPath,
            });
            break;
          case 'lg':
            compositeParts.push({
              input: symbolPath,
              top: 9,
              left: 8,
            });
            break;
          case 'sm':
            compositeParts.push({
              input: symbolPath,
              // TODO top left
            });
            break;
          default:
            compositeParts.push({
              input: symbolPath,
            });
        }

        // Merge a sub-location
        if (childStatus !== 'none') {
          const childTemplate = config.markerTemplates[childStatus].default.sm;
          const childPath = path.join(templatesBase, childTemplate + '.png');
          compositeParts.push({
            input: childPath,
            gravity: 'southeast',
          });
        }

        sharp(templatePath)
          .composite(compositeParts)
          .png()
          .toFile(iconPath, (errf) => {
            if (errf) {
              return next(errf);
            }

            return res.sendFile(iconPath, sendFileOptions, (errs) => {
              if (errs) {
                return next(errs);
              }
            });
          });
      });
    });
  });
};
