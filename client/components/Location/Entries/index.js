
var EntryView = require('./Entry');

module.exports = function (entries) {
  // Parameters:
  //   entries
  //     EntriesModel

  var _entryViewsMap = {};  // id -> entryView

  var _handleEntryCreated;
  var _handleEntryRemoved;

  // Keep track how many of the given entries are visible.
  // Do not count added or removed entries; exact number of rendered
  // entries does not matter, only the positions in the given entries.
  var _maxVisible = 10; // Current ceiling. Can be increased by more button.
  var _numberVisible = 0; // Num of given entries appended.
  var _stepVisible = 10; // How much maxVisible will be grown per more click.

  this.bind = function ($mount) {
    var ents = entries.toArray();
    var appendEntry, appendShowMore, appendEntries;

    appendEntry = function (e) {
      var id = e.getId();
      var v = new EntryView(e);

      _entryViewsMap[id] = v;

      $mount.append('<div id="' + id + '"></div>');
      v.bind($('#' + id));
    };

    appendShowMore = function () {
      $mount.append('<button id="tresdb-location-entries-more" ' +
        'class="btn btn-primary btn-block" type="button">' +
        '<span class="glyphicon glyphicon-chevron-down" aria-hidden="true">' +
        '</span> ' +
        'Show more posts</button>');
      var $more = $('#tresdb-location-entries-more');
      $more.click(function () {
        $more.remove();
        _maxVisible += _stepVisible;
        appendEntries();
      });
    };

    appendEntries = function () {
      var appendable = ents.slice(_numberVisible, _maxVisible);
      for (var i = 0; i < appendable.length; i += 1) {
        appendEntry(appendable[i]);
        _numberVisible += 1;
      }
      // If hidden entries still remain, show more button
      if (_numberVisible < ents.length) {
        appendShowMore();
      }
    };

    // Initial visible entries
    appendEntries();

    _handleEntryCreated = function (ev) {
      // Create view and store it among others

      var newEntry = entries.getEntry(ev.data.entryId);
      var id = newEntry.getId();
      var v = new EntryView(newEntry);

      _entryViewsMap[id] = v;

      $mount.prepend('<div id="' + id + '"></div>');
      v.bind($('#' + id));
    };

    _handleEntryRemoved = function (ev) {

      // Remove entry from _entryViewsMap.
      var id = ev.data.entryId;
      var v = _entryViewsMap[id];
      delete _entryViewsMap[id];

      // Remove entry's HTML and unbind view.
      v.unbind();
      $('#' + id).fadeOut('slow', function () {
        $('#' + id).remove();
      });
    };

    entries.on('location_entry_created', _handleEntryCreated);
    entries.on('location_entry_removed', _handleEntryRemoved);
  };

  this.unbind = function () {
    // Unbind each child
    Object.keys(_entryViewsMap).forEach(function (k) {
      _entryViewsMap[k].unbind();
    });

    entries.off('location_entry_created', _handleEntryCreated);
    entries.off('location_entry_removed', _handleEntryRemoved);
  };
};
