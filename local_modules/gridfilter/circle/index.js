exports.getIndices = (x, y, r) => {
  // List of indices intersecting with the circle when
  // x, y and r are floats.

  const indices = []
  const R = Math.ceil(r) + 1
  const X = Math.floor(x)
  const Y = Math.floor(y)

  // Go through a quarter, and copy the points within radius
  // to the other quarters.
  let i, j, dx, dy
  for (i = X - R; i < X + R; i += 1) {
    for (j = Y - R; j < Y + R; j += 1) {
      // Pixel distance from (x, y).
      // Pixel midpoint at 0.5 0.5
      dx = i + 0.5 - x
      dy = j + 0.5 - y
      if (dx * dx + dy * dy <= r * r + 1) {
        indices.push([i, j])
      }
    }
  }

  // For very small circles, ensure there is at least one pixel.
  indices.push([X, Y])

  return indices
}
