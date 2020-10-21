module.exports = [
  {
    collection: 'entries',
    spec: { locationId: 1 },
    options: {},
  },
  {
    collection: 'events',
    spec: { time: 1 },
    options: {},
  },
  {
    collection: 'events',
    spec: { locationId: 1 },
    options: {},
  },
  {
    collection: 'locations',
    spec: { geom: '2dsphere' },
    options: {},
  },
  {
    collection: 'locations',
    spec: { layer: 1 },
    options: {},
  },
  {
    // Text index
    collection: 'locations',
    spec: {
      text1: 'text',  // primary
      text2: 'text',  // secondary
    },
    options: {
      weights: {
        text1: 3,
        text2: 1,
      },
      name: 'TextIndex',
    },
  },
  {
    collection: 'users',
    spec: { email: 1 },
    options: { unique: true },
  },
  {
    collection: 'users',
    spec: { name: 1 },
    options: { unique: true },
  },
];
