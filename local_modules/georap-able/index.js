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

exports.able = function (cap) {
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

exports.ableOwn = function (capr) {
  // Takes a capability without -any or -own postfix and
  // returns a middleware that allows access if the user
  // is able to <capr>-any OR if req.isOwner is set true
  // and the user is able to <capr>-own.
  //
  // Parameters:
  //   capr
  //     string, capability root without -any or -own postfixes
  //
  // Return
  //   function (req, res, next)
  //     a express middleware fn
  //
  return function (req, res, next) {
    if (exports.isAble(req.user, capr + '-any')) {
      return next()
    }
    if (req.isOwner && exports.isAble(req.user, capr + '-own')) {
      return next()
    }
    const msg = 'You are not capable of accessing this resource'
    return res.status(status.FORBIDDEN).send(msg)
  }
}
