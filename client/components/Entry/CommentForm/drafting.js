// Methods to store and retrieve non-submitted work locally.
var blankComment = {
  markdown: '',
  attachments: [],
};

exports.start = function (entryId) {
  // Start drafting. Idempotent operation: drafting can be
  // ensured to be started by calling start().
  var itemKey = 'georap-form-' + entryId;
  var item = window.sessionStorage.getItem(itemKey);
  if (!item) {
    // Begin drafting by setting the item.
    var jsonStr = JSON.stringify(blankComment);
    window.sessionStorage.setItem(itemKey, jsonStr);
  }
  // else drafting has already begun
};

exports.stop = function (entryId) {
  // Stop drafting and prevent any further saves.
  // Idempotent operation.
  var itemKey = 'georap-form-' + entryId;
  window.sessionStorage.removeItem(itemKey);
};

exports.started = function (entryId) {
  // Return true if drafting started for the id
  var itemKey = 'georap-form-' + entryId;
  var item = window.sessionStorage.getItem(itemKey);
  if (item) {
    return true;
  }
  return false;
};

exports.load = function (entryId) {
  // Load saved draft if drafting started.
  var itemKey = 'georap-form-' + entryId;
  var jsonStr = window.sessionStorage.getItem(itemKey);
  if (jsonStr) {
    return JSON.parse(jsonStr);
  }
  // else load called without starting the draft
  throw new Error('Start drafting before load call');
};

exports.save = function (entryId, entryData) {
  // Save draft if drafting started.
  var itemKey = 'georap-form-' + entryId;
  // Check if drafting
  var item = window.sessionStorage.getItem(itemKey);
  if (item) {
    // Overwrite
    var jsonStr = JSON.stringify(entryData);
    window.sessionStorage.setItem(itemKey, jsonStr);
  } else {
    // else start not yet called
    throw new Error('Start drafting before save call');
  }
};

exports.reset = function (entryId) {
  // Clear draft if drafting started.
  var itemKey = 'georap-form-' + entryId;
  // Check if drafting
  var item = window.sessionStorage.getItem(itemKey);
  if (item) {
    // Overwrite with blank
    var jsonStr = JSON.stringify(blankComment);
    window.sessionStorage.setItem(itemKey, jsonStr);
  } else {
    // else start not yet called
    throw new Error('Start drafting before reset call');
  }
};
