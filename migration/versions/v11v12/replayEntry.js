module.exports = (crev, chevs, comments) => {
  // Parameters:
  //   crev
  //     location_entry_created event
  //   chevs
  //     an array of location_entry_changed events
  //   comments
  //     an array of comments for the entry

  // Init and then build forward.
  const entry = Object.assign({}, crev.data.entry);

  chevs.forEach(chev => {
    Object.keys(chev.data.delta).forEach(prop => {
      entry[prop] = chev.data.delta[prop];
    });
  });

  entry.comments = comments;

  return entry;
}
