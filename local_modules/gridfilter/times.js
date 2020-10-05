module.exports = (n, fn) => {
  // Run function fn n times.
  const result = []
  for (let i = 0; i < n; i += 1) {
    result.push(fn(i))
  }
  return result
}
