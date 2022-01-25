const getAllOfLocationComplete = require('./getAllOfLocationComplete');
const path = require('path');
const _ = require('lodash');

module.exports = (args, callback) => {
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
  //
  const locId = args.locationId;
  getAllOfLocationComplete(locId, (err, realEntries) => {
    if (err) {
      return callback(err);
    }

    const newEntries = args.entryCandidates.filter((ec) => {
      // Pass only those entry candidates that differ from every current
      // entry. Entry is different if creator, text, OR file basename differs.
      return _.every(realEntries, (re) => {
        // True if is different.s
        // Paths are null for descriptions
        let reBase = null;
        if (re.attachments.length > 0) {
          reBase = path.basename(re.attachments[0].filepath);
        }
        const ecBase = ec.filepath ? path.basename(ec.filepath) : null;
        return (re.user !== ec.username ||
                re.markdown !== ec.markdown ||
                reBase !== ecBase);
      });
    });

    return callback(null, newEntries);
  });
};
