module.exports = (comments) => {
  // In-entry comment object from v11 to v12
  //
  // Parameters:
  //   comments
  //     array of v11 comment objects
  //
  // Return
  //   array of v12 comment objects
  //
  if (!comments) {
    return [];
  }

  return comments.map(comment => {
    return Object.assign({}, comment, {
      attachments: comment.attachments ? comment.attachments : [],
    });
  });
};
