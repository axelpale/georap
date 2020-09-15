const Mapper = require('./Mapper')
const test = require('tape')

test('Mapper basic usage', (t) => {
  var m = new Mapper(0, 2, 1, 3)
  t.strictEqual(m.map(0), 1)
  t.strictEqual(m.map(1), 2)
  t.strictEqual(m.map(2), 3)
  t.strictEqual(m.map(3), 4)
  t.strictEqual(m.map(-3), -2)
  t.end()
})

test('Mapper zero-width domain', (t) => {
  var n = new Mapper(0, 0, 1, 2)
  t.true(isNaN(n.map(0)))
  t.false(isFinite(n.map(1)))
  t.end()
})

test('Mapper zero-width range', (t) => {
  var m = new Mapper(0, 1, 1, 1)
  t.strictEqual(m.map(-123), 1)
  t.end()
})
