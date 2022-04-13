// Ensure that optional config properties have values.
// Detect missing optional properties and set them.
//
// This helps in backward compatibility and prevents
// MAJOR version increaments when new config props are introduced.
// Also, this way we need to write default config values only here.
//
// Modify this file when new optional props are introduced.
//

module.exports = (config) => {
  // Modify in place.

  // markerTemplateSizes
  // Introduced in v14.1. Required in v15.
  if (!config.markerTemplateSizes) {
    config.markerTemplateSizes = {
      sm: {
        width: 9,
        height: 14,
      },
      md: {
        width: 22,
        height: 40,
      },
      lg: {
        width: 38,
        height: 66,
      },
    };
  }

  return config;
};
