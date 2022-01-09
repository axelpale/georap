const config = require('georap-config');
const httpDefaultPort = 80;
const httpsDefaultPort = 443;

module.exports = function () {
  // Return
  //   string, the public url to the site root
  //     depending on the site configuration.
  //     For example 'http://localhost:3000' or 'https://mysite.georap.fi'
  //
  const protocol = config.publicProtocol + '://';
  const host = config.publicHostname;
  const pp = config.publicPort; // integer
  let port = '';
  if (config.publicProtocol === 'https') {
    port = (pp === httpsDefaultPort ? '' : ':' + pp);
  } else { // http
    port = (pp === httpDefaultPort ? '' : ':' + pp);
  }
  return protocol + host + port;
};
