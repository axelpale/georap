// Intended for client-side only.

var marked = require('marked');
var timestamp = require('timestamp');

// Setup
marked.setOptions({ breaks: true });

exports.isHidden = function ($el) {
  return $el.hasClass('hidden');
};

exports.show = function ($el) {
  $el.removeClass('hidden');
};

exports.hide = function ($el) {
  $el.addClass('hidden');
};

exports.toggleHidden = function ($el) {
  $el.toggleClass('hidden');
};

exports.cap = function (s) {
  // Capitalize the first letter of string s.
  if (typeof s !== 'string') {
    return '';
  }
  return s.charAt(0).toUpperCase() + s.slice(1);
};

exports.flash = function ($el) {
  // Change element background color temporarily.
  // Useful to highlight things.
  //
  // Parameters:
  //   $el: jQuery element
  //
  var DURATION = 2;
  var DELAY = 2;
  var SECOND = 1000;
  $el.css('transition', 'background-color ' + DURATION + 's');
  $el.addClass('georap-flash');
  window.setTimeout(function () {
    $el.removeClass('georap-flash');
  }, DELAY * SECOND);
  window.setTimeout(function () {
    $el.css('transition', 'unset');
  }, (DURATION + DELAY) * SECOND);
};

exports.markdownToHtml = function (markdown) {
  return marked.parse(markdown);
};

exports.locationstamp = function (location) {
  var url = '/locations/' + location._id;
  return '<a href="' + url + '">' + location.name + '</a>';
};

exports.timestamp = timestamp;

exports.pointstamp = function (points) {
  var p = points;
  var h = '<span class="georap-pointstamp">';

  if (p > 0) {
    // Plus sign
    h += '<span>+' + p + '</span>&nbsp;';
  } else if (p < 0) {
    // Special, wide minus sign
    h += '<span>–' + Math.abs(p) + '</span>&nbsp;';
  } else {
    return ''; // No points
  }

  var g = '<span class="glyphicon glyphicon-star" aria-label="stars"></span>';

  return h + g + '</span>';
};

exports.placestamp = function (places) {
  // String representation for location.places array
  //
  // Parameters
  //   places
  //     array of strings, places
  //
  if (places.length > 1) {
    return places[0] + ', ' + places[places.length - 1];
  }
  if (places.length > 0) {
    return places[0];
  }
  return '';
};

exports.resetRadio = function ($parent, toValue) {
  var checkedOnce = false;
  $parent.find('.radio input').each(function (el) {
    if (el.value === toValue) {
      el.checked = true;
      checkedOnce = true;
    } else {
      el.checked = false;
    }
  });
  // Ensure at least one is selected. If not, check the first.
  if (!checkedOnce) {
    $parent.find('.radio input').get(0).checked = true;
  }
};

exports.sizestamp = function (bytes) {
  // Return file size in human readable format.
  // E.g.
  //
  var SEP = '&nbsp;';
  var KB = 1024;
  var MB = KB * KB;
  if (bytes < KB) {
    return bytes + SEP + 'B';
  }
  if (bytes < MB) {
    var kbytes = bytes / KB;
    if (kbytes < 10) {
      return kbytes.toFixed(1) + SEP + 'kiB';
    }
    return Math.round(kbytes) + SEP + 'kiB';
  }
  var mbytes = bytes / MB;
  if (mbytes < 10) {
    return mbytes.toFixed(1) + SEP + 'MiB';
  }
  return Math.round(mbytes) + SEP + 'MiB';
};

exports.onBy = function (emitter, listeners) {
  // Call emitter.on(key, value) for each key-value pair in listeners.
  Object.keys(listeners).forEach(function (k) {
    emitter.on(k, listeners[k]);
  });
};

exports.offBy = function (emitter, listeners) {
  // Call emitter.off(key, value) for each key-value pair in listeners.
  Object.keys(listeners).forEach(function (k) {
    emitter.off(k, listeners[k]);
  });
};

exports.offAll = function (obj) {
  // Call .off() for each value in obj.
  // Skip values that do not have off() method
  Object.keys(obj).forEach(function (k) {
    if (obj[k].off) {
      obj[k].off();
    }
  });
};

exports.unbindAll = function (obj) {
  Object.keys(obj).forEach(function (k) {
    obj[k].unbind();
  });
};

exports.isAdvancedUpload = function () {
  // Drag-n-drop feature support recognition.
  // See https://css-tricks.com/drag-and-drop-file-uploading/
  var div = document.createElement('div');
  return (
    ('draggable' in div) ||
    ('ondragstart' in div && 'ondrop' in div)
  ) && 'FormData' in window && 'FileReader' in window;
};

exports.throttle = function (duration, iteratee) {
  // Simple throttle without trailing call.
  // Useful to prevent double clicks.
  var timeout = 0;

  var resetTimeout = function () {
    timeout = 0;
  };

  return function (a, b, c, d) {
    if (timeout) {
      // Stop clicks if a click handler was throttled.
      if (a.preventDefault) {
        a.preventDefault();
        a.stopPropagation();
      }
      return;
    }

    // NOTE timeout is a positive integer
    timeout = setTimeout(resetTimeout, duration);
    return iteratee(a, b, c, d);
  };
};
