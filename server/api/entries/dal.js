/* eslint-disable max-lines,no-magic-numbers */

const db = require('tresdb-db');
const urls = require('georap-urls-server');
const path = require('path');
const _ = require('lodash');
const purifyMarkdown = require('purify-markdown');
const eventsDal = require('../events/dal');

// Private methods

const insertOne = (entry, callback) => {
  // Parameters:
  //   entry
  //     raw entry to insert
  //   callback
  //     function (err, entryId);
  const coll = db.collection('entries');

  coll.insertOne(entry, (err, result) => {
    if (err) {
      return callback(err);
    }
    return callback(null, result.insertedId);
  });
};

// Public methods

exports.count = (callback) => {
  // Count non-deleted entries
  //
  // Parameters:
  //   callback
  //     function (err, number)
  //
  db.collection('entries')
    .countDocuments({ deleted: false })
    .then((number) => {
      return callback(null, number);
    })
    .catch((err) => {
      return callback(err);
    });
};

exports.createLocationEntry = (params, callback) => {
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

  insertOne(newEntry, (err, newEntryId) => {
    if (err) {
      return callback(err);
    }

    newEntry._id = newEntryId;
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

exports.changeLocationEntry = (params, callback) => {
  // Modify entry markdown, attachments, or flags.
  //
  // Parameters:
  //   params:
  //     oldEntry
  //       raw entry object
  //     username
  //       string
  //     locationName
  //       because entries dont store location name but events do
  //     delta
  //       object of changed values
  //   callback
  //     function (err)
  //
  const oldEntry = params.oldEntry;
  const coll = db.collection('entries');
  const q = { _id: oldEntry._id };
  const delta = Object.assign({}, params.delta); // keep original intact

  // Sanitize possible markdown
  if ('markdown' in delta) {
    delta.markdown = purifyMarkdown(delta.markdown).trim();
  }

  // Ensure minimal delta by including only values that differ.
  // This step also ensures that forbidden properties have no effect.
  const minDelta = {};
  const original = {};
  if (delta.markdown !== oldEntry.markdown) {
    minDelta.markdown = delta.markdown;
    original.markdown = oldEntry.markdown;
  }
  if (!_.isEqual(delta.attachments, oldEntry.attachments)) {
    minDelta.attachments = delta.attachments;
    original.attachments = oldEntry.attachments;
  }
  if (!_.isEqual(delta.flags, oldEntry.flags)) {
    minDelta.flags = delta.flags;
    original.flags = oldEntry.flags;
  }

  const changedEntry = Object.assign({}, oldEntry, minDelta);

  coll.replaceOne(q, changedEntry, (err) => {
    if (err) {
      return callback(err);
    }

    const eventParams = {
      entryId: oldEntry._id,
      locationId: oldEntry.locationId,
      locationName: params.locationName,
      username: params.username,
      delta: minDelta,
      original: original,
    };

    eventsDal.createLocationEntryChanged(eventParams, (everr) => {
      if (everr) {
        return callback(everr);
      }

      return callback(null, changedEntry);
    });
  });
};

exports.filterUniqueLocationEntries = function (args, callback) {
  // Append given entries into the given location if they do not yet exist.
  //
  // Parameters
  //   args
  //     locationId
  //       ObjectId
  //     entryCandidates
  //       array of objects:
  //         username
  //         markdown
  //         filepath
  //           basename is compared
  //   callback
  //     function (err, uniqueEntries)
  //       err
  //       uniqueEntries
  //         subset of given entryCandidates

  const locId = args.locationId;
  exports.getAllOfLocationComplete(locId, function (err, realEntries) {
    if (err) {
      return callback(err);
    }

    var newEntries = args.entryCandidates.filter(function (ec) {
      // Pass only those entry candidates that differ from every current
      // entry. Entry is different if creator, text, OR file basename differs.
      return _.every(realEntries, function isDifferent(re) {
        // Paths are null for descriptions
        let reBase = null;
        if (re.attachments.length > 0) {
          reBase = path.basename(re.attachments[0].filepath);
        }
        var ecBase = ec.filepath ? path.basename(ec.filepath) : null;
        return (re.user !== ec.username ||
                re.markdown !== ec.markdown ||
                reBase !== ecBase);
      });
    });

    return callback(null, newEntries);
  });
};

exports.getOneComplete = function (entryId, callback) {
  // Find single entry with attachments.
  // Expand their URLs.
  //
  return db.collection('entries')
    .aggregate([
      {
        $match: {
          _id: entryId,
        },
      },
      {
        $lookup: {
          from: 'attachments',
          localField: 'attachments',
          foreignField: 'key',
          as: 'attachments',
        },
      },
    ])
    .toArray((err, entries) => {
      if (err) {
        return callback(err);
      }

      if (entries.length === 0) {
        return callback(null, null);
      }

      const entry = entries[0];

      // Complete attachment URLs
      entry.attachments = entry.attachments.map(urls.completeAttachment);

      return callback(null, entry);
    });
};

exports.getOneRaw = function (entryId, callback) {
  // Find single entry
  //
  // Parameters:
  //   entryId
  //   callback
  //     function (err, entryDoc)
  //
  var coll = db.collection('entries');
  var q = {
    _id: entryId,
  };

  coll.findOne(q, function (err, doc) {
    if (err) {
      return callback(err);
    }

    if (!doc) {
      return callback(null, null);
    }

    return callback(null, doc);
  });
};

exports.getAllOfLocationComplete = (locationId, callback) => {
  // Get all non-deleted entries of a location with their attachments.
  //
  // Parameters:
  //   locationId
  //     object id
  //   callback
  //     function (err, entries)
  //
  return db.collection('entries')
    .aggregate([
      {
        $match: {
          locationId: locationId,
          deleted: false,
        },
      },
      {
        $sort: {
          time: -1, // most recent first
        },
      },
      // Collect attachment keys from comments for further processing.
      // NOTE $concatArrays cannot be used to concatenate already nested arrays
      // such as the one returned by '$comments.attachments'
      {
        $addFields: {
          commentAttachments: {
            $reduce: {
              input: '$comments.attachments',
              initialValue: [],
              in: {
                $concatArrays: ['$$value', '$$this'],
              },
            },
          },
        },
      },
      // Replace attachment keys with attachment objects
      {
        $lookup: {
          from: 'attachments',
          localField: 'attachments',
          foreignField: 'key',
          as: 'attachments',
        },
      },
      // Replace gathered comment attachment keys with attachment objects
      {
        $lookup: {
          from: 'attachments',
          localField: 'commentAttachments',
          foreignField: 'key',
          as: 'commentAttachments',
        },
      },
    ]).toArray((err, entries) => {
      if (err) {
        return callback(err);
      }

      // Complete attachment URLs
      entries.forEach(entry => {
        entry.attachments = entry.attachments.map(urls.completeAttachment);
      });

      // Complete comment attachment objects and their URLs
      const catReducer = (dict, cat) => {
        dict[cat.key] = cat;
        return dict;
      };
      entries.forEach(entry => {
        // Gather comment attachments to a fast-access dict
        const cats = entry.commentAttachments.reduce(catReducer, {});
        // Replace in-comment attachment keys with attachment objects.
        entry.comments.forEach((comment) => {
          comment.attachments = comment.attachments.map((catKey) => {
            const cat = cats[catKey];
            // Complete url
            return urls.completeAttachment(cat);
          });
        });
        // Forget the temporary cats array
        delete entry.commentAttachments;
      });

      return callback(null, entries);
    });
};

exports.getAllOfLocationRaw = function (locationId, callback) {
  // Get all non-deleted entries of a location, most recent first.
  //
  // Parameters
  //   locationId
  //     object id
  //   callback
  //     function (err, entries)

  var coll = db.collection('entries');
  var q = {
    locationId: locationId,
    deleted: false,
  };
  var opt = { sort: { time: -1 } };

  return coll.find(q, opt).toArray(callback);
};


exports.getAllOfUser = function (username, callback) {
  // Return all non-deleted entries created by user,
  // ordered from oldest to newest.
  //
  // Parameters
  //   username
  //     string
  //   callback
  //     function (err, entries)

  var coll = db.collection('entries');
  var q = {
    user: username,
    deleted: false,
  };

  coll.find(q).sort({ time: 1 }).toArray(callback);
};


exports.removeLocationEntry = function (params, callback) {
  // Mark entry as deleted. The worker or a migration step
  // will remove deleted entries and their attachments at some point.
  //
  // Parameters:
  //   params
  //     entryId
  //     locationId
  //     locationName
  //     username
  //     entry
  //       entry object
  //   callback
  //     function (err)
  //

  const q = { _id: params.entryId };
  const u = {
    $set: {
      deleted: true,
    },
  };

  db.collection('entries').updateOne(q, u, function (err) {
    if (err) {
      return callback(err);
    }
    eventsDal.createLocationEntryRemoved(params, callback);
  });
};


exports.createLocationEntryComment = (params, callback) => {
  // Add new comment object to entry.comments
  //
  // Parameters:
  //   params
  //     locationId
  //     entryId
  //     locationName
  //     username
  //     markdown: markdown UTF8 string
  //     attachments: optional array of attachment keys
  //   callback
  //     function (err)
  //
  // Precondition:
  //   markdown is sanitized
  //
  const time = db.timestamp();
  const rand1 = Math.random().toString().substr(2, 10);
  const rand2 = Math.random().toString().substr(2, 10);
  const commentId = time.substr(0, 4) + rand1 + rand2; // 24 chars

  const coll = db.collection('entries');
  const filter = { _id: params.entryId };

  let attachments = [];
  if (params.attachments) {
    attachments = params.attachments;
  }

  const comment = {
    id: commentId,
    time: time,
    user: params.username,
    markdown: params.markdown,
    attachments: attachments,
  };

  const update = {
    $push: {
      comments: comment,
    },
  };

  coll.updateOne(filter, update, (err) => {
    if (err) {
      return callback(err);
    }

    const eventParams = {
      locationId: params.locationId,
      locationName: params.locationName,
      entryId: params.entryId,
      comment: comment,
    };

    eventsDal.createLocationEntryCommentCreated(eventParams, callback);
  });
};

exports.changeLocationEntryComment = function (params, callback) {
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

exports.removeLocationEntryComment = function (params, callback) {
  // Parameters:
  //   params
  //     username
  //     locationId
  //     locationName
  //     entryId
  //     commentId
  //   callback
  //     function (err)

  var coll = db.collection('entries');
  var filter = { _id: params.entryId };

  var commentId = params.commentId;

  var update = {
    $pull: {
      comments: {
        id: commentId,
      },
    },
  };

  coll.updateOne(filter, update, function (err) {
    if (err) {
      return callback(err);
    }

    var eventParams = params;
    eventsDal.createLocationEntryCommentRemoved(eventParams, callback);
  });
};
