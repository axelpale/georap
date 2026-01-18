const timestamp = require('./index')
const test = require('tape')

test('basic', (t) => {
  // a short time, default locale
  const now = new Date();
  setTimeout(() => {
    // Find phrase in HTML
    const searchTerm = 'a few seconds ago';
    t.true(timestamp.render(now.toISOString()).indexOf(searchTerm) >= 0);
    t.end();
  }, 200);
});

test('locale', (t) => {
  // a short time, custom locale
  const now = new Date();
  setTimeout(() => {
    // Find phrase in HTML
    const searchTerm = 'muutama sekunti sitten';
    t.true(timestamp.render(now.toISOString(), 'fi').indexOf(searchTerm) >= 0);
    t.end();
  }, 200);
});

test('exact', (t) => {
  // ensure correct length and format
  const now = new Date();
  const s = timestamp.exact(now.toISOString(), 'fi');
  console.log(s);
  t.equal(s.length, 19);
  t.equal(s[10], ' ');
  t.end();
});
