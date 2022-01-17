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
    const role = req.user.role;
    const caps = config.capabilities[role];

    if (caps.includes(cap)) {
      return next();
    }

    const msg = 'User is not capable of accessing this resource';
    return res.status(status.FORBIDDEN).send(msg);
  };
};
