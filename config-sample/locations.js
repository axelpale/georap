// Location classification: status.
// The first in the list is used as the default.
// The list order defines the button order on the location page.
exports.locationStatuses = [
  'unknown',
  'active',
  'guarded',
  'locked',
  'abandoned',
  'ruined',
  'buried',
  'demolished',
  'natural',
];

// Location classification: type
// Comment out types you do not need or add your own.
// Each type needs a matching png symbol available under
// directory: config/images/markers/symbols
// The order of the list defines the button order in symbol pickers.
exports.locationTypes = [
  'default',
  'castle',
  'military',
  'residental',
  'mansion',
  'building',
  'town',
  'agricultural',
  'farm',
  'camp',
  'parking',
  'natural',
  'bird',
  'water',
  'beach',
  'tree',
  'rock',
  'crater',
  'grave',
  'church',
  'spiritual',
  'scientific',
  'nuclear',
  'museum',
  'info',
  'private',
  'shop',
  'restaurant',
  'movietheatre',
  'leisure',
  'canoe',
  'sports',
  'school',
  'hospital',
  'sawmill',
  'mining',
  'workshop',
  'factory',
  'railway',
  'marine',
  'vehicle',
  'roadhouse',
  'aviation',
  'helicopter',
  'firestation',
  'infrastructure',
  'electricity',
  'communications',
  'watermanagement',
  'watchtower',
  'lighthouse',
  'bridgesmall',
  'bridge',
  'tunnel',
  'underground',
  'freak',
];

// Marker templates.
// Marker template is a background image for the marker without a symbol.
// It determines the shape and color for the combined marker icons.
// The configuration here is a mapping:
//   status -> flag -> size -> template_name.
// where:
//   status
//     Location status.
//   flag
//     Post flag. The locations where the user has created
//     a post with a flag will show as markers
//     built with these templates. For example, locations with posts
//     flagged as 'visit' can be configured to show in special color
//     for the user who created the visits.
//     Locations where the user has not created any flagged posts
//     will use templates configured as 'default' for the given status.
//   size
//     There are three sizes: 'sm', 'md', and 'lg'. Emphasized locations
//     will show up with large markers.
//   template_name:
//     A template file name without file extension. You can add or edit
//     template images at config/images/markers/templates
//     NOTE template name must contain only lowercase letters and/or
//     underscores for the server to parse it correctly.
//
exports.markerTemplates = {
  'unknown': {
    'default': {
      'sm': 'red_default_sm',
      'md': 'red_default_md',
      'lg': 'red_default_lg',
    },
    'visit': {
      'sm': 'yellow_default_sm',
      'md': 'yellow_default_md',
      'lg': 'yellow_default_lg',
    },
  },
  'active': {
    'default': {
      'sm': 'red_light_sm',
      'md': 'red_light_md',
      'lg': 'red_light_lg',
    },
    'visit': {
      'sm': 'yellow_light_sm',
      'md': 'yellow_light_md',
      'lg': 'yellow_light_lg',
    },
  },
  'guarded': {
    'default': {
      'sm': 'red_light_sm',
      'md': 'red_light_md',
      'lg': 'red_light_lg',
    },
    'visit': {
      'sm': 'yellow_light_sm',
      'md': 'yellow_light_md',
      'lg': 'yellow_light_lg',
    },
  },
  'locked': {
    'default': {
      'sm': 'red_light_sm',
      'md': 'red_light_md',
      'lg': 'red_light_lg',
    },
    'visit': {
      'sm': 'yellow_light_sm',
      'md': 'yellow_light_md',
      'lg': 'yellow_light_lg',
    },
  },
  'abandoned': {
    'default': {
      'sm': 'red_default_sm',
      'md': 'red_default_md',
      'lg': 'red_default_lg',
    },
    'visit': {
      'sm': 'yellow_default_sm',
      'md': 'yellow_default_md',
      'lg': 'yellow_default_lg',
    },
  },
  'ruined': {
    'default': {
      'sm': 'red_dark_sm',
      'md': 'red_dark_md',
      'lg': 'red_dark_lg',
    },
    'visit': {
      'sm': 'yellow_dark_sm',
      'md': 'yellow_dark_md',
      'lg': 'yellow_dark_lg',
    },
  },
  'buried': {
    'default': {
      'sm': 'red_darker_sm',
      'md': 'red_darker_md',
      'lg': 'red_darker_lg',
    },
    'visit': {
      'sm': 'yellow_darker_sm',
      'md': 'yellow_darker_md',
      'lg': 'yellow_darker_lg',
    },
  },
  'demolished': {
    'default': {
      'sm': 'red_darker_sm',
      'md': 'red_darker_md',
      'lg': 'red_darker_lg',
    },
    'visit': {
      'sm': 'yellow_darker_sm',
      'md': 'yellow_darker_md',
      'lg': 'yellow_darker_lg',
    },
  },
  'natural': {
    'default': {
      'sm': 'red_default_sm',
      'md': 'red_default_md',
      'lg': 'red_default_lg',
    },
    'visit': {
      'sm': 'yellow_default_sm',
      'md': 'yellow_default_md',
      'lg': 'yellow_default_lg',
    },
  },
};
