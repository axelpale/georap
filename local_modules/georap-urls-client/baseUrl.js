var protocol = georap.config.publicProtocol
var hostname = georap.config.publicHostname
var publicPort = georap.config.publicPort // integer
var httpDefaultPort = 80
var httpsDefaultPort = 443

module.exports = function () {
  // Return
  //   string, the public url to the site root
  //     depending on the site configuration.
  //     For example 'http://localhost:3000' or 'https://mysite.georap.fi'
  //
  var port = ''
  if (protocol=== 'https') {
    port = (publicPort === httpsDefaultPort ? '' : ':' + publicPort)
  } else { // http
    port = (publicPort === httpDefaultPort ? '' : ':' + publicPort)
  }
  return protocol + '://' + hostname + port
}
