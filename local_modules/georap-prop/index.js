/* eslint-disable no-var */

exports.get = function (obj, path) {
  // Get a property by property path string
  //
  // Parameters:
  //   obj
  //   path
  //     string with '.' used as property name delimiter.
  //     Path '' return the object itself
  //     Cannot handle array indices, yet.
  //
  // Return
  //   value deep in the object or undefined if not found.
  //
  if (typeof path !== 'string') {
    throw new TypeError('Invalid property path: ' + path)
  }

  if (path === '') {
    return obj
  }

  var parts = path.split('.')

  // Walk the path through the object
  var i, key
  var step = obj
  for (i = 0; i < parts.length; i += 1) {
    key = parts[i]
    if (typeof step === 'object') {
      if (key in step) {
        step = step[key]
      } else {
        return // undefined
      }
    } else {
      return // undefined
    }
  }

  return step
}

exports.set = function (obj, path, value) {
  // Set a property by property path string.
  // Is able to create new properties and objects.
  // If path does not exist in the obj, the required structure is created.
  // Any non-objects along the path will be overwritten.
  //
  // Parameters:
  //   obj
  //   path
  //     string with '.' used as property name delimiter.
  //     Path '' will return the value itself without modifying obj.
  //     Cannot handle array indices, yet.
  //   value
  //     value to be set
  //
  // Return
  //   obj
  //
  if (typeof path !== 'string') {
    throw new TypeError('Invalid property path: ' + path)
  }

  if (path === '') {
    return value
  }

  var parts = path.split('.')

  // Walk the path through the object
  var i, key
  var step = obj
  for (i = 0; i < parts.length - 1; i += 1) {
    key = parts[i]
    if (typeof step[key] === 'object') {
      step = step[key]
    } else {
      step[key] = {}
      step = step[key]
    }
  }

  step[parts[parts.length - 1]] = value

  return obj
}
