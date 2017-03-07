
exports.forEach = function (cursor, iteratee, callback) {
  // Execute iteratee for each item in cursor in series.
  //
  // Parameters:
  //   cursor
  //     MongoDB cursor
  //   iteratee
  //     function (item, next)
  //       item
  //       next
  //         function (err)
  //   callback
  //     function (err)

  (function step(err) {
    if (err) {
      cursor.close();
      return callback(err);
    }

    cursor.next(function (err2, r) {
      if (err2) {
        cursor.close();
        return callback(err2);
      }

      if (r === null) {
        // End
        return callback();
      }

      return iteratee(r, step);
    });
  }());
};
