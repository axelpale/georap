var imageLinks = require('./imageLinks');

module.exports = function (overlays, descriptions) {
  var entries = [];

  overlays.forEach(function (ol) {
    entries.push({
      markdown: ol.name + ': ' + ol.description,
      filepath: ol.href,
      overlay: {
        viewBoundScale: ol.viewBoundScale,
        latLonBox: ol.latLonBox,
      },
    });
  });

  descriptions.forEach(function (desc) {
    var imgUrls = imageLinks.find(desc);
    var textContent = imageLinks.strip(desc);
    var i;

    if (imgUrls.length === 0) {
      // No images, single entry
      entries.push({
        markdown: textContent,
        filepath: null,
      });
    } else {
      // First image with the text.
      entries.push({
        markdown: textContent,
        filepath: imgUrls[0],
      });

      // Next images without description
      for (i = 1; i < imgUrls.length; i += 1) {
        entries.push({
          markdown: '',
          filepath: imgUrls[i],
        });
      }
    }
  });

  return entries;
};
