// Singleton wrapper to determine hostname on the first connection
// and share it with the rest of the app.

// Domain name is required by some handlers, for example
// when a link is sent via email. It does not matter if
// the connection is transported via polling or websockets,
// the host stays the same.

let host = null;

exports.init = function (hostname) {
  if (host === null) {
    host = hostname;
  }
};

exports.get = function () {
  if (host !== null) {
    return host;
  }

  throw new Error('hostname.init must be called before hostname.get');
};

exports.mock = function (customHostname) {
  // Replace the hostname with a custom hostname.
  // Useful when building unit tests.
  host = customHostname;
};
