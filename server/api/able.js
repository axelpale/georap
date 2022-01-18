// Capability middleware.
//
const config = require('georap-config');
const status = require('http-status-codes');

module.exports = function (capn) {
  // Returns a middleware function (req, res, next)
  //   that calls next if user has the required capability.
  //
  const cap = capn.toLowerCase();

  return function (req, res, next) {
    // Determine role of current client
    let role = 'public';
    if (req.user && req.user.role) {
      role = req.user.role;
    }

    // Capabilities of this role
    const caps = config.capabilities[role];

    // Do the capabilities include the required capability.
    if (caps.includes(cap)) {
      return next();
    }

    const msg = 'You are not capable of accessing this resource';
    return res.status(status.FORBIDDEN).send(msg);
  };
};
