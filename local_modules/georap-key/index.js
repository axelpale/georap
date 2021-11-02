const nanoid = require('nanoid')
const nolookalikes = require('nanoid-dictionary/nolookalikes')
const generate = nanoid.customAlphabet(nolookalikes, 8)

// Attachment key pattern for validation.
// Direct usage: keyPattern.test('somestring')
exports.keyPattern = /^[a-zA-Z0-9]{8}$/

exports.generate = function () {
  return generate()
}

exports.validate = function (key) {
  return exports.keyPattern.test(key)
}
