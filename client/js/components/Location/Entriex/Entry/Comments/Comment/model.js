
var forwarders = {
  'location_entry_comment_changed', function (comment, ev) {
    Object.assign(comment, ev.data.delta);
  },
};

exports.forward = models.forward(forwarders);
