const test = require('tape')
const models = require('./index')
const rootBus = require('minibus').create()

test('bus', t => {
  const busFactory = models.bus((obj, ev) => {
    return obj.foo === ev.baz && ev.baz === 'bar'
  })

  const obj = {
    foo: 'bar'
  }

  const bus = busFactory(obj, rootBus)

  let calls = 0
  bus.on('test-event', function (ev) {
    calls += 1
  })

  // Send three test events. Only two should pass the test.
  rootBus.emit('test-event', {
    baz: 'bar'
  })
  rootBus.emit('test-event', {
    baz: '666'
  })
  rootBus.emit('test-event', {
    baz: 'bar'
  })
  // Fourth event with correct ev but wrong event name
  rootBus.emit('other-event', {
    baz: 'bar'
  })

  t.equal(calls, 2, 'number of calls')
  t.end()
})
