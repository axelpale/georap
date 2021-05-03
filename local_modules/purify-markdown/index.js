// Intended for server-side to sanitize any markdown content from client.

const marked = require('marked')
const createDOMPurify = require('dompurify')
const { JSDOM } = require('jsdom')
const TurndownService = require('turndown')

// Setup
marked.setOptions({ breaks: true })
const turndown = new TurndownService({
  emDelimiter: '*',
  br: ''
})
const window = new JSDOM('').window
const dompurify = createDOMPurify(window)

// API
module.exports = function (dirtyMarkdown) {
  // Convert (possibly dirty) markdown to safe markdown.
  const dirtyHtml = marked(dirtyMarkdown)
  const safeHtml = dompurify.sanitize(dirtyHtml)
  const safeMarkdown = turndown.turndown(safeHtml)
  return safeMarkdown
}
