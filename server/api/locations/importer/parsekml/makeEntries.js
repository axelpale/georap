const imageLinks = require('./imageLinks');

module.exports = (overlays, descriptions) => {
  // Make batch entries from captured overlays and descriptions.
  const entries = [];

  overlays.forEach((ol) => {
    entries.push({
      markdown: ol.name + ': ' + ol.description,
      filepath: ol.href,
      overlay: {
        viewBoundScale: ol.viewBoundScale,
        latLonBox: ol.latLonBox,
      },
    });
  });

  descriptions.forEach((desc) => {
    const imgUrls = imageLinks.find(desc);
    const textContent = imageLinks.strip(desc);
    let i;

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
