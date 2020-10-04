const Mapper = require('./Mapper')
const MarkerGrid = require('./MarkerGrid')
const times = require('./times')
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

test('Mapper inverse', (t) => {
  var m = new Mapper(-4, 0, 4, 6)
  t.strictEqual(m.inverse(8), 4)
  t.end()
})

test('MarkerGrid test run', (t) => {
  // Build a MarkerGrid
  const latLngBounds = {
    east: 10,
    north: 10,
    south: 0,
    west: 0
  }
  const gridSize = {
    width: 10,
    height: 10
  }
  const grid = new MarkerGrid(latLngBounds, gridSize)
  // Generate points
  times(25, () => {
    const lng = 20 * Math.random() - 5
    const lat = 20 * Math.random() - 5
    grid.add({
      geom: {
        coordinates: [lng, lat]
      }
    })
  })
  console.log(grid.toString())
  const filteredMarkers = grid.getMarkers()
  console.log('Filtered: ', filteredMarkers.length)
  t.ok(filteredMarkers.length > 0)
  t.end()
})
