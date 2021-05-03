const config = require('georap-config');
const Ajv = require('ajv');

// Precompile flag precondition validators.
// The preconditions use json schemas.
// Also gather flags into object for simpler validation code in handlers.
const ajv = new Ajv();
const flagMap = Object.keys(config.entryFlags).reduce((acc, flagName) => {
  const schema = config.entryFlags[flagName].precondition;
  acc[flagName] = {
    name: flagName,
    validatePrecondition: ajv.compile(schema),
  };
  return acc;
}, {});

module.exports = flagMap;
