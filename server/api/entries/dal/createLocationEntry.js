const db = require('tresdb-db');
const purifyMarkdown = require('purify-markdown');
const eventsDal = require('../../events/dal');

module.exports = (params, callback) => {
  // Parameters:
  //   params:
  //     locationId
  //       ObjectId
  //     locationName
  //       string, for event
  //     username
  //       string
  //     markdown
  //       optional string or null
  //     attachments
  //       optional array of attachment keys
  //     flags
  //       optional array of instance-specific flags e.g. 'visit'
  //   callback
  //     function (err, insertedId)
  //

  if (!params.locationId || !params.username) {
    throw new Error('Missing parameter: locationId or username');
  }

  const sanitizedMarkdown = purifyMarkdown(params.markdown).trim();

  if (typeof params.markdown !== 'string') {
    params.markdown = '';
  }
  if (typeof params.attachments !== 'object') {
    params.attachments = [];
  }
  if (typeof params.flags !== 'object') {
    params.flags = [];
  }

  const newEntry = {
    user: params.username,
    time: db.timestamp(),
    locationId: params.locationId,
    deleted: false,
    published: false,
    markdown: sanitizedMarkdown,
    attachments: params.attachments,
    comments: [],
    flags: params.flags,
  };

  db.collection('entries').insertOne(newEntry, (err, result) => {
    if (err) {
      return callback(err);
    }

    // Add id before emit
    newEntry._id = result.insertedId;

    const eventParams = {
      username: params.username,
      locationId: params.locationId,
      locationName: params.locationName,
      entry: newEntry,
    };

    eventsDal.createLocationEntryCreated(eventParams, (errr) => {
      if (errr) {
        return callback(errr);
      }
      return callback(null, newEntry);
    });
  });
};
