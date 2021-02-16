module.exports = (comments) => {
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
