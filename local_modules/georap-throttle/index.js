/* eslint-disable no-var */
// Asynchronous throttling
//

module.exports = function (iteratee, duration) {
  // This function decorator prevents repeated calls of iteratee
  // within the given duration and until the iteratee has finished.
  // Any call within this locking period is queued and when the locking
  // period ends, the most recent of the queued calls will be executed,
  // which starts the new locking period.
  //
  // Usage
  //   var throttledFn = throttle((arg, cb) => {
  //     ... do stuff with arg ...
  //     cb()
  //   }, 1000)
  //
  // Parameters:
  //   iteratee
  //     fn(arg, callback) where callback must be called after execution
  //   duration
  //     integer, milliseconds
  //
  var queueArg = null
  var hasQueueArg = false
  var returned = true
  var waited = true

  var callback = function () {
    // Async response received
    returned = true

    if (waited) {
      if (hasQueueArg) {
        returned = false
        waited = false
        hasQueueArg = false
        callNow(queueArg)
      }
      // Else we have already
      // waited and called back
      // and no further calls in queue.
    }
  }

  var timeback = function () {
    // Timeout fired
    waited = true

    if (returned) {
      if (hasQueueArg) {
        returned = false
        waited = false
        hasQueueArg = false
        callNow(queueArg)
      }
      // Else we have already
      // waited and called back
      // and no further calls in queue.
    }
  }

  var callNow = function (arg) {
    // Call immediately
    iteratee(arg, callback)
    // Set timer
    setTimeout(timeback, duration)
  }

  return function (arg) {
    if (returned && waited) {
      // Prevent further calls for now
      returned = false
      waited = false
      // Call
      callNow(arg)
    } else {
      // Too early for new call. Store for later. Overwrite previous if any.
      hasQueueArg = true
      queueArg = arg
    }
  }
}
