const db = require('tresdb-db');
const eventsDal = require('../../events/dal');

module.exports = (params, callback) => {
  // Parameters:
  //   params
  //     locationId
  //     locationName
  //     entryId
  //     username
  //     commentId
  //     original
  //       original values of props in delta
  //     delta
  //       markdown: markdown UTF8 string
  //       attachments: an array of attachment keys
  //   callback
  //     function (err)
  //
  // Precondition
  //   original and delta are minimal (contain only changed prop values)
  //
  const coll = db.collection('entries');
  const filter = {
    _id: params.entryId,
    'comments.id': params.commentId,
  };

  // Sanitize input and build update
  let update = {
    $set: {},
  };
  if (params.delta.markdown) {
    update.$set['comments.$.markdown'] = params.delta.markdown;
  }
  if (params.delta.attachments) {
    update.$set['comments.$.attachments'] = params.delta.attachments;
  }

  coll.updateOne(filter, update, function (err) {
    if (err) {
      return callback(err);
    }

    eventsDal.createLocationEntryCommentChanged(params, callback);
  });
};
