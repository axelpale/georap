// Capability middleware.
// For server-side use only.
//
const config = require('georap-config')
const status = require('http-status-codes')

exports.isAble = function (user, cap) {
  // Return
  //   boolean
  //
  const capn = cap.toLowerCase() // normalize

  let role = 'public'
  if (user && user.role) {
    role = user.role
  }
  // Capabilities of this role
  const caps = config.capabilities[role]

  // Do the capabilities include the required capability.
  return caps.includes(capn)
}

exports.middleware = function (cap) {
  // Returns a middleware function (req, res, next)
  //   that calls next if user has the required capability.
  //
  return function (req, res, next) {
    if (exports.isAble(req.user, cap)) {
      return next()
    }
    const msg = 'You are not capable of accessing this resource'
    return res.status(status.FORBIDDEN).send(msg)
  }
}
