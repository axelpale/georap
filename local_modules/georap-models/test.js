const test = require('tape')
const unit = require('./lib/bus')
const minibus = require('minibus')

test('lib.bus calls', t => {
  const busFactory = unit((obj, ev) => {
    return obj.foo === ev.baz && ev.baz === 'bar'
  })

  const obj = {
    foo: 'bar'
  }

  const rootBus = minibus.create()
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

test('lib.bus off', t => {
  // Setup.
  const busFactory = unit((obj, ev) => {
    // Pass only events of same color
    return obj.color === ev.color
  })
  const obj = {
    color: 'red'
  }
  const rootBus = minibus.create()
  const bus = busFactory(obj, rootBus)

  // Count calls
  let calls = 0
  bus.on('test-event', function () {
    calls += 1
  })

  // First, a couple basic calls.
  rootBus.emit('test-event', { color: 'red' })
  rootBus.emit('test-event', { color: 'blue' })
  // And test that only first came through
  t.equal(calls, 1, 'num of calls')

  // Second, stop counting
  bus.off()
  rootBus.emit('test-event', { color: 'red' })
  // No increase
  t.equal(calls, 1, 'num of calls')

  // Third, rebind
  bus.on('test-event', function () {
    calls += 1
  })
  rootBus.emit('test-event', { color: 'red' })
  rootBus.emit('test-event', { color: 'blue' })
  // Increased again
  t.equal(calls, 2, 'num of calls')

  t.end()
})
