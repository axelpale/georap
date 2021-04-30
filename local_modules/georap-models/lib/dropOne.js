/* eslint-disable no-var */

module.exports = function (arr, test) {
  // Modify the given array by dropping the first element that
  // matches the given test.

  // Find index
  var i, index
  index = -1
  for (i = 0; i < arr.length; i += 1) {
    if (test(arr[i])) {
      index = i
      break
    }
  }

  // Already removed if not found, thus return
  if (index === -1) {
    return
  }

  // Remove in place
  arr.splice(index, 1)
}
