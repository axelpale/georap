// Client-side cookie set/get module.
// Adapted from
//   litejs/browser-cookie-lite
//   https://stackoverflow.com/questions/14573223
//

exports.setCookie = function (name, value, days, httpOnly) {
  let expires = ''
  let secure = ''

  if (days) {
    const at = Date.now() + days * 24 * 60 * 60 * 1000 // ms
    expires = '; expires=' + (new Date(at)).toUTCString()
  }
  if (httpOnly) {
    secure = '; secure'
  }

  // Set new cookie. Note, this does not overwrite other cookies.
  document.cookie = name + '=' + encodeURIComponent(value) +
    expires + secure
}

exports.getCookie = function (name) {
  // Find the cookie form the stringified list
  const attribs = ('; ' + document.cookie).split('; ' + name + '=')[1]
  if (attribs) {
    // Pick only the value
    return decodeURIComponent(attribs.split(';')[0])
  }
  // No such cookie
  return ''
}

exports.removeCookie = function (name) {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT'
}
