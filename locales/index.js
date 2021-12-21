/* eslint-disable no-sync */
const fs = require('fs');
const path = require('path');
const config = require('georap-config');

const builtinLocalesPath = __dirname;
const customLocalesPath = path.resolve(__dirname, '../config/locales');

const catalog = {};
const customCatalog = {};

// Recognize and read built-in locale dictionaries
config.availableLocales.forEach((locale) => {
  const filename = locale + '.json';
  let dictJson;
  try {
    dictJson = fs.readFileSync(path.join(builtinLocalesPath, filename));
  } catch (err) {
    throw new Error('Failed to read a built-in locale: ' + filename);
  }

  try {
    catalog[locale] = JSON.parse(dictJson);
  } catch (err) {
    throw new Error('Invalid JSON syntax in the built-in locale: ' + filename);
  }
});

// Read custom dictionaries if available
config.availableLocales.forEach((locale) => {
  const filename = locale + '.json';
  let dictJson;
  try {
    dictJson = fs.readFileSync(path.join(customLocalesPath, filename));
  } catch (err) {
    // No custom translations for this locale. This is okay. Next.
    return;
  }

  try {
    customCatalog[locale] = JSON.parse(dictJson);
  } catch (err) {
    // Custom catalog has some errors.
    throw new Error('Invalid JSON syntax in the custom locale: ' + filename);
  }
});

// Merge the custom catalog and the built-in catalog.
// The custom catalog might contain translations not in the built-in catalog
// due to custom flags and tags.
Object.keys(customCatalog).forEach((locale) => {
  // Test if such built-in locale exists. User might typo the custom locale.
  if (!catalog[locale]) {
    const msg = 'Unknown locale ' + locale +
      '. Available locales are: ' + config.availableLocales.join(',');
    throw new Error(msg);
  }
  // Overwrite built-in translation
  const customDict = customCatalog[locale];
  Object.keys(customDict).forEach((key) => {
    catalog[locale][key] = customDict[key];
  });
});

// Catalog is now merged with custom translations.

// Export the merged catalog: locale --> key --> translation
module.exports = catalog;
