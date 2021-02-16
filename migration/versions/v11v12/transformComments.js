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
    return {
      id: comment.id,
      time: comment.time,
      user: comment.user,
      markdown: comment.message,
      attachments: comment.attachments ? comment.attachments : [],
    };
  });
};
