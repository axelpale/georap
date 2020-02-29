const timestamp = require('./index')
const test = require('tape')

test('basic', (t) => {
  var now = new Date();
  setTimeout(() => {
    var searchTerm = 'less than a minute ago';
    t.true(timestamp(now.toISOString()).indexOf(searchTerm) >= 0);
    t.end();
  }, 200);
});
