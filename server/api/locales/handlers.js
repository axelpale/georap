const i18n = require('i18n');
const status = require('http-status-codes');

exports.getAvailableLocales = (req, res) => {
  // List of available locales as JSON
  return res.json({
    availableLocales: i18n.getLocales(),
  });
};

exports.getLocale = (req, res) => {
  // Get translations for the given locale.
  // Client requests this when changing language.
  //
  const requestedLocale = req.params.locale;
  const availableLocales = i18n.getLocales();

  if (!availableLocales[requestedLocale]) {
    const msg = 'No locale available in ' + requestedLocale;
    return res.status(status.NOT_FOUND).send(msg);
  }

  return res.json({
    locale: requestedLocale,
    catalog: i18n.getCatalog(requestedLocale),
  });
};
