// Methods to store and retrieve non-submitted work locally.
var blankEntryData = {
  markdown: '',
  attachments: [],
  flags: [],
};

exports.start = function (locId) {
  // Start drafting. Idempotent operation: drafting can be
  // ensured to be started by calling start().
  var itemKey = 'georap-form-' + locId;
  var item = window.sessionStorage.getItem(itemKey);
  if (!item) {
    // Begin drafting by setting the item.
    var jsonStr = JSON.stringify(blankEntryData);
    window.sessionStorage.setItem(itemKey, jsonStr);
  }
  // else drafting has already begun
};

exports.stop = function (locId) {
  // Stop drafting and prevent any further saves.
  var itemKey = 'georap-form-' + locId;
  window.sessionStorage.removeItem(itemKey);
};

exports.started = function (locId) {
  // Return true if drafting started for the location
  var itemKey = 'georap-form-' + locId;
  var item = window.sessionStorage.getItem(itemKey);
  if (item) {
    return true;
  }
  return false;
};

exports.load = function (locId) {
  // Load saved draft if drafting started.
  var itemKey = 'georap-form-' + locId;
  var jsonStr = window.sessionStorage.getItem(itemKey);
  if (jsonStr) {
    return JSON.parse(jsonStr);
  }
  // else load called without starting the draft
  throw new Error('Start drafting before load call');
};

exports.save = function (locId, entryData) {
  // Save draft if drafting started.
  var itemKey = 'georap-form-' + locId;
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

exports.reset = function (locId) {
  // Clear draft if drafting started.
  var itemKey = 'georap-form-' + locId;
  // Check if drafting
  var item = window.sessionStorage.getItem(itemKey);
  if (item) {
    // Overwrite with blank
    var jsonStr = JSON.stringify(blankEntryData);
    window.sessionStorage.setItem(itemKey, jsonStr);
  } else {
    // else start not yet called
    throw new Error('Start drafting before reset call');
  }
};
