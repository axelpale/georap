// Architecture note:
// Why we need a schema for each version?
// Would it be sufficient to have only the latest schema?
// Older schemas would still be in version history.
// Sounds tempting? But no, let us version schemas. Why:
// Some migration tests use old schemas to validate their function.
// Why we need to maintain tests for old version migrations?
// It is possible, that at some point a critical georap instance needs to be
// migrated several versions, including the old steps. A bug in those steps
// is much easier to fix, if we have tests for the version step in question.
// Therefore there is benefit in having schemas for different versions.
//
// Maybe at some point we split migration tests into submodules.
// Then, it might become more convenient to have only the latest schema
// and put any test-specific validation within the test module.
//

module.exports = {
  'v12': require('./v12'),
  'v14': require('./v14'),
};
