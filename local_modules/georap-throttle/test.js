const test = require('tape')
const throttle = require('./index')

test('throttle fast call', { timeout: 1500 }, (t) => {
  let letters = ''

  const throttledFn = throttle((letter, then) => {
    letters += letter
    setTimeout(then, 100)
  }, 500)

  // First should be immediate
  throttledFn('a')
  t.equal(letters, 'a')

  // This becomes throttled because both duration and delay
  setTimeout(() => {
    throttledFn('b')
    t.equal(letters, 'a')
  }, 50)

  // This becomes throttled because duration
  setTimeout(() => {
    throttledFn('c')
    t.equal(letters, 'a')
  }, 200)

  // 'c' has been executed at T+500.
  // 'd' becomes throttled. The lock is freed at T+1000
  setTimeout(() => {
    throttledFn('d')
    t.equal(letters, 'ac')
  }, 600)

  setTimeout(() => {
    t.equal(letters, 'ac')
  }, 900)

  setTimeout(() => {
    t.equal(letters, 'acd')
    t.end()
  }, 1100)
})

test('throttle slow call', { timeout: 1000 }, (t) => {
  let letters = ''

  const throttledFn = throttle((letter, then) => {
    letters += letter
    setTimeout(then, 400)
  }, 200)

  throttledFn('a')
  t.equal(letters, 'a')

  // Queued
  setTimeout(() => {
    throttledFn('b')
    t.equal(letters, 'a')
  }, 100)

  // Queued
  setTimeout(() => {
    throttledFn('c')
    t.equal(letters, 'a')
  }, 300)

  // 'c' at T+400. Locked until T+800
  setTimeout(() => {
    throttledFn('d') // immediate
    t.equal(letters, 'acd')
    t.end()
  }, 900)
})

test('throttle sync call', { timeout: 800 }, (t) => {
  let letters = ''

  const throttledFn = throttle((letter, then) => {
    letters += letter
    then() // immediate sync return
  }, 200)

  // Immediate
  throttledFn('a')
  t.equal(letters, 'a')

  // Queued. 'b' at T+200
  setTimeout(() => {
    throttledFn('b')
    t.equal(letters, 'a')
  }, 100)

  // Locked until T+400
  // Immediate
  setTimeout(() => {
    throttledFn('c')
    t.equal(letters, 'abc')
    t.end()
  }, 500)
})
