module.exports = function (forwarders) {
  // Forwarder factory. Forwarder is a function that modifies given
  // object by given event.
  //
  // Parameters:
  //   forwarders
  //     a map from event name to function (obj, ev)
  //
  return function (obj, ev) {
    if (ev.type in forwarders) {
      forwarders[ev.type](obj, ev)
    }
  }
}
