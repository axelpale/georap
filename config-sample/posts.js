
// Post list view settings
exports.entries = {
  // Items to load initially and when Load More -button is pressed.
  pageSize: 10,
};

// Post commenting
exports.comments = {
  secondsEditable: 360,
  minMessageLength: 2,
  maxMessageLength: 600,
};

// Flags for Posts.
// Flags are used to classify posts (aka entries) or give them perks.
// An example of a flag is 'visit' that can denote that the post is
// about a visitation on the location instead of just general info.
// Flags also accumulate to the location of the flagged post, so
// that a user can filter locations based on flags in their own posts.
// For example the 'visit' flag allows a user to browse all locations
// she has visited.
// Translation of flags: to display flags in different languages
// the name and description of the flag are in fact translation keys.
// Because the flags are customized by you, Georap cannot know translations
// for them automatically. For that, you must give translations for the keys
// in the custom locales under config/locales.
exports.entryFlags = {
  visit: {
    name: 'visit', // a translation key
    genitive: 'visit-genitive', // a translation key
    plural: 'visit-plural', // a translation key
    description: 'visit-description', // a translation key
    glyphicon: 'flag',
    reward: 15,
    // Precondition allows a flag to be used only if the post content
    // fulfills a condition. Post content consists of
    // the post properties { markdown, attachments, flags }.
    // The condition is represented as JSON schema.
    precondition: {
      type: 'object',
      properties: {
        attachments: {
          type: 'array',
          minItems: 1,
        },
      },
      required: ['attachments'],
    },
  },
};
