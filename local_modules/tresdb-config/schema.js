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
    defaultMapState: {
      type: 'object',
      properties: {
        lat: {
          type: 'number',
        },
        lng: {
          type: 'number',
        },
        zoom: {
          type: 'integer',
        },
        mapTypeId: {
          type: 'string',
          enum: ['roadmap', 'satellite', 'hybrid', 'terrain'],
        },
      },
      additionalProperties: false,
    },
    supportButtonTitle: {
      type: 'string',
    },
    supportPageContent: {
      type: 'string',
    },
    loginBackground: {
      type: 'string',
    },
    secret: {
      type: 'string',
      minLength: 8,
    },
    googleMapsKey: {
      type: 'string',
    },
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
    publicProtocol: {
      type: 'string',
      enum: ['http', 'https'],
    },
    port: {
      type: 'integer',
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
      additionalProperties: false,
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
      additionalProperties: false,
    },
    smtp: {
      type: 'object',
      properties: {
        host: {
          type: 'string',
          format: 'hostname',
        },
        port: {
          type: 'integer',
        },
        secure: {
          type: 'boolean',
        },
        auth: {
          type: 'object',
          properties: {
            user: {
              type: 'string',
            },
            pass: {
              type: 'string',
            },
          },
        },
      },
    },
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
    entryFlags: {
      type: 'array',
      items: {
        type: 'string',
      },
      uniqueItems: true,
    },
    markerTemplates: {
      type: 'object',
    },
    comments: {
      type: 'object',
      properties: {
        minMessageLength: {
          type: 'integer',
        },
        maxMessageLength: {
          type: 'integer',
        },
      },
      additionalProperties: false,
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
    exportServices: {
      type: 'array',
      items: {
        type: 'array',
        items: [
          {
            type: 'string',
          },
          {
            type: 'string',
          },
          {
            type: 'string',
          },
          {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                east: {
                  type: 'number',
                },
                north: {
                  type: 'number',
                },
                south: {
                  type: 'number',
                },
                west: {
                  type: 'number',
                },
              },
              additionalProperties: false,
            },
          },
        ],
        additionalItems: false,
      },
    },
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
    'defaultMapState',
    'supportButtonTitle',
    'supportPageContent',
    'loginBackground',
    'secret',
    'googleMapsKey',
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
    'publicProtocol',
    'port',
    'admin',
    'mongo',
    'smtp',
    'mail',
    'locationStatuses',
    'locationTypes',
    'entryFlags',
    'markerTemplates',
    'comments',
    'coordinateSystems',
    'exportServices',
    'bcrypt',
    'env',
    'features',
  ],
  additionalProperties: false,
};
