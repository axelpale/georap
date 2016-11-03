
module.exports = function (items) {
  // Usage:
  //   var dl = new DensityList([a, b, c]);
  //
  // Parameters:
  //   items
  //     an ordered array of items, the densest first.
  //     The class modifies the items array directly!!!

  // The index of first non-null element.
  var first = 0;

  this.popDensest = function () {
    // Remove and return the current densest item in the list.
    //
    // Return:
    //   item
    //     the densest in the list
    //   null
    //     if list is empty

    var i, t, j;

    t = null;

    for (i = first; i < items.length; i += 1) {
      if (items[i] !== null) {
        t = items[i];
        items[i] = null;
        break;
      }
    }

    // Now, i = the index first non-null element, but it just became null.
    // i + 1 might also be null. We must find the new first non-null.
    if (i < items.length) {
      for (j = i; j < items.length; j += 1) {
        if (items[j] !== null) {
          first = j;
          break;
        }  // else continue until non-null element is found
      }
    }

    return t;
  };

  this.removeMultiple = function (itemsToRemove) {
    // Parameters:
    //   itemsToRemove
    //     an array of objects with at least an _id property been set.
    //
    // Return
    //   number of items removed

    var i, j, n;

    // Count number of removed items.
    n = 0;

    for (i = first; i < items.length; i += 1) {
      if (items[i] !== null) {
        for (j = 0; j < itemsToRemove.length; j += 1) {
          if (items[i]._id.equals(itemsToRemove[j]._id)) {
            items[i] = null;
            n += 1;
            break;
          }
        }
      }
    }

    return n;
  };

  this.isEmpty = function () {

    var i;

    for (i = first; i < items.length; i += 1) {
      if (items[i] !== null) {

        return false;
      }
    }

    return true;
  };

};
