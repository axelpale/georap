const purifyMarkdown = require('./index')
const test = require('tape')

test('compatibility', (t) => {
  const messages = [
    '*Hello world*',
    '**Hello world**',
    '[link](https://www.example.com)',
    'Hello\nworld',
    'Hello\n\nworld'
  ]

  messages.forEach(msg => {
    t.equal(purifyMarkdown(msg), msg)
  })

  t.end()
})

test('strip extra whitespace', (t) => {
  t.equal(purifyMarkdown('Hello  world'), 'Hello world')
  t.end()
})

test('convert br tags to line breaks', (t) => {
  t.equal(purifyMarkdown('Hello<br>world'), 'Hello\nworld')
  t.end()
})

test('escape unescaped syntax', (t) => {
  t.equal(purifyMarkdown('H*ll on +örth'), 'H\\*ll on +örth')
  t.end()
})

test('remove scripts', (t) => {
  const msg = 'Hello my <script>alert(\'xss\');</script>friends'
  t.equal(purifyMarkdown(msg), 'Hello my friends')
  t.end()
})
