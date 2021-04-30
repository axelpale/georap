const nanoid = require('nanoid')
const nolookalikes = require('nanoid-dictionary/nolookalikes')
const generate = nanoid.customAlphabet(nolookalikes, 8)

exports.generate = function () {
  return generate()
}
