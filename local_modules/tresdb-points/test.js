const test = require('tape')
const unit = require('./index')

test('entry points', t => {
  const points = unit({
    type: 'location_entry_changed',
    data: {
      original: {
        attachments: [{}, {}, {}]
      },
      delta: {
        attachments: []
      }
    }
  })

  t.equal(points, -6)
  t.end()
})
