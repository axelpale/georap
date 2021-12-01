# Custom locales

The locales under /config/locales are applied on top of the built-in locales at /locales. In other words, translations defined in custom locales override the built-in translations.

A custom locale does not need to be complete and can even be empty. When the app needs a translation and the custom locale does not contain that translation, the built-in translation under /locales is used.

See the built-in locales under /locales for available translation keywords.
