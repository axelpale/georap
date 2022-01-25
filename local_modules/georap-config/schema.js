// JSON schema for Georap config.

// Define reuseable types first
const defaultMapStateSchema = require('./defaultMapStateSchema');
const iconSchema = require('./iconSchema');
const exportServicesSchema = require('./exportServicesSchema');
const smtpSchema = require('./smtpSchema');
const entryFlagsSchema = require('./entryFlagsSchema');

// Then the full config

module.exports = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      minLength: 1,
    },
    description: {
      type: 'string',
    },
    admin: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
        },
        email: {
          type: 'string',
          format: 'email',
        },
        password: {
          type: 'string',
        },
      },
      required: ['username', 'email', 'password'],
      additionalProperties: false,
    },
    secret: {
      type: 'string',
      minLength: 8,
    },
    googleMapsKey: {
      type: 'string',
    },
    publicProtocol: {
      type: 'string',
      enum: ['http', 'https'],
    },
    publicHostname: {
      type: 'string',
      format: 'hostname',
    },
    publicPort: {
      type: 'integer',
    },
    port: {
      type: 'integer',
    },
    mongo: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
        },
        testUrl: {
          type: 'string',
        },
      },
      required: ['url'],
      additionalProperties: false,
    },
    smtp: smtpSchema,
    mail: {
      type: 'object',
      properties: {
        sender: {
          type: 'string',
          format: 'email',
        },
      },
      additionalProperties: false,
    },
    // FILES AND PATHS
    staticDir: {
      type: 'string',
    },
    staticUrl: {
      type: 'string',
    },
    uploadDir: {
      type: 'string',
    },
    uploadUrl: {
      type: 'string',
    },
    uploadThumbSize: {
      type: 'integer',
    },
    uploadSizeLimit: {
      type: 'integer',
    },
    tempUploadDir: {
      type: 'string',
    },
    tempUploadUrl: {
      type: 'string',
    },
    tempUploadTimeToLive: {
      type: 'integer',
    },
    tempUploadSizeLimit: {
      type: 'integer',
    },
    logDir: {
      type: 'string',
    },
    // USER MANAGEMENT
    roles: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    defaultRole: {
      type: 'string',
    },
    capabilities: {
      type: 'object',
    },
    // THEME AND BRAND
    defaultLocale: {
      type: 'string',
    },
    availableLocales: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    defaultMapState: defaultMapStateSchema,
    icons: {
      type: 'array',
      items: iconSchema,
    },
    appleTouchIcons: {
      type: 'array',
      items: iconSchema,
    },
    loginPageSize: {
      type: 'string',
      enum: ['half', 'medium', 'full'],
    },
    loginBackground: {
      type: 'string',
    },
    loginColor: {
      type: 'string',
      enum: ['muted', 'primary', 'success', 'info', 'warning', 'danger'],
    },
    locationStatuses: {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 1,
      uniqueItems: true,
    },
    locationTypes: {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 1,
      uniqueItems: true,
    },
    rewards: {
      type: 'object',
      required: ['eventBased', 'attachmentBased'],
    },
    entryFlags: entryFlagsSchema,
    markerTemplates: {
      type: 'object',
    },
    entries: {
      type: 'object',
      properties: {
        pageSize: {
          type: 'integer',
        },
      },
      required: [
        'pageSize',
      ],
      additionalProperties: false,
    },
    comments: {
      type: 'object',
      properties: {
        secondsEditable: {
          type: 'integer',
        },
        minMessageLength: {
          type: 'integer',
        },
        maxMessageLength: {
          type: 'integer',
        },
      },
      required: [
        'secondsEditable',
        'minMessageLength',
        'maxMessageLength',
      ],
      additionalProperties: false,
    },
    // Support page
    enableSupportPage: {
      type: 'boolean',
    },
    supportButtonTitle: {
      type: 'string',
    },
    supportPageContent: {
      type: 'string',
    },
    coordinateSystems: {
      type: 'array',
      items: {
        type: 'array',
        items: {
          type: 'string',
        },
        minItems: 3,
        maxItems: 3,
      },
      minItems: 1,
    },
    exportServices: exportServicesSchema,
    bcrypt: {
      type: 'object',
      properties: {
        rounds: {
          type: 'integer',
        },
      },
      additionalProperties: false,
    },
    env: {
      type: 'string',
      enum: ['production', 'development', 'test'],
    },
    features: {
      type: 'object',
    },
  },
  // Require all
  required: [
    'title',
    'description',
    'admin',
    'secret',
    'googleMapsKey',
    'publicProtocol',
    'publicHostname', // changed in v14
    'publicPort', // new in v14
    'port',
    'mongo',
    'smtp',
    'mail',
    // FILES AND PATHS
    'staticDir',
    'staticUrl',
    'uploadDir',
    'uploadUrl',
    'uploadThumbSize',
    'uploadSizeLimit',
    'tempUploadDir',
    'tempUploadUrl',
    'tempUploadTimeToLive',
    'tempUploadSizeLimit',
    'logDir',
    // USER MANAGEMENT
    'roles', // new in v14
    'capabilities', // new in v14
    // THEME AND BRAND
    'availableLocales',
    'defaultLocale',
    'defaultMapState',
    'icons', // new in v12, require in v13
    'appleTouchIcons', // new in v12, require in v13
    'loginBackground',
    'loginColor', // new in v12, require in v13
    'locationStatuses',
    'locationTypes',
    'rewards',
    'entryFlags',
    'markerTemplates',
    'entries',
    'comments',
    'enableSupportPage', // new in v12, require in v13
    'supportButtonTitle',
    'supportPageContent',
    'coordinateSystems',
    'exportServices',
    'bcrypt',
    'env',
    'features',
  ],
  additionalProperties: false,
};
