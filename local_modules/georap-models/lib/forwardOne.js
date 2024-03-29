module.exports = function (model, test) {
  // A factory for single-object forwarding.
  // Stops forwarding if no object found that matches the test.
  //
  // Parameters
  //   model
  //     a model with .forward method. If object passes the test,
  //     it will be handled by the model.forward
  //   test
  //     function (obj, ev) => bool
  //
  // Returns
  //   function (arr, ev) where
  //     arr
  //       an array of objects
  //     ev
  //       event to be applied to the matched object
  //
  return function (arr, ev) {
    const obj = arr.find(function (o) {
      return test(o, ev)
    })
    if (obj) {
      model.forward(obj, ev)
    }
  }
}
