const nanoid = require('nanoid')
const nolookalikes = require('nanoid-dictionary/nolookalikes')
const generate = nanoid.customAlphabet(nolookalikes, 10)

exports.generate = function () {
  return generate()
}
