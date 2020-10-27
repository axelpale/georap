const DistFilter = require('./index')
const test = require('tape')

test('Minimal test', (t) => {
  // Build a DistFilter
  const r = 10
  const f = new DistFilter(r)
  // Generate three points. Imagine 10x10 grid.
  f.add({
    geom: {
      coordinates: [0, 0]
    }
  })
  t.equal(f.getMarkers().length, 1)

  f.add({
    geom: {
      coordinates: [10, 10]
    }
  })
  // Added because far enough
  t.equal(f.getMarkers().length, 2)

  f.add({
    geom: {
      coordinates: [4, 4]
    }
  })
  // Not added because too close.
  t.equal(f.getMarkers().length, 2)

  // Ensure first has a child and the second does not have.
  const ms = f.getMarkers()
  t.equal(ms[0].childCount, 1)
  t.equal(ms[1].childCount, 0)

  t.end()
})
