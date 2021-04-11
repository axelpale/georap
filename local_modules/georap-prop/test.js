const test = require('tape')
const proptools = require('./index')

test('get', (t) => {
  // Get leaf
  t.equal(proptools.get({
    some: {
      deep: {
        value: 'foobar'
      }
    }
  }, 'some.deep.value'), 'foobar')

  // Get branch
  t.deepEqual(proptools.get({
    some: {
      deep: {
        value: 'foobar'
      }
    }
  }, 'some.deep'), {
    value: 'foobar'
  })

  // Too deep
  t.ok(typeof proptools.get({
    some: {
      deep: {
        value: 'foobar'
      }
    }
  }, 'some.deep.value.missing') === 'undefined')

  // Arrays not supported
  t.throws(() => {
    proptools.get([0], 0)
  }, TypeError)

  // Empty object
  t.ok(typeof proptools.get({}, 'some.missing') === 'undefined')

  // Single part
  t.equal(proptools.get({
    some: 'foobar'
  }, 'some'), 'foobar')

  // Self
  t.deepEqual(proptools.get({}, ''), {})

  // Empty path parts
  t.equal(proptools.get({
    '': {
      some: {
        value: 'foobar'
      }
    }
  }, '.some.value'), 'foobar')

  // Invalid path
  t.throws(() => {
    proptools.get({}, null)
  })

  t.end()
})

test('set', (t) => {
  // Structure creation
  t.deepEqual(proptools.set({}, 'some.deep.value', 'foobar'), {
    some: {
      deep: {
        value: 'foobar'
      }
    }
  })

  // Overwriting
  t.deepEqual(proptools.set({
    some: 'foobar'
  }, 'some.deep.value', 'foobar'), {
    some: {
      deep: {
        value: 'foobar'
      }
    }
  })

  // Pruning
  t.deepEqual(proptools.set({
    some: {
      deep: {
        value: 'foobar'
      }
    }
  }, 'some.deep', 'foobar'), {
    some: {
      deep: 'foobar'
    }
  })

  // Single part
  t.deepEqual(proptools.set({
    some: 'foobar'
  }, 'some', 'barbar'), {
    some: 'barbar'
  })

  // Perverted path
  t.deepEqual(proptools.set({}, '..', {}), {
    '': {
      '': {
        '': {}
      }
    }
  })

  // Invalid path
  t.throws(() => {
    proptools.set({}, null, 'foobar')
  })

  t.end()
})
