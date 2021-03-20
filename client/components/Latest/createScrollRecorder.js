
module.exports = function () {
  var _scrollPosition = 0;
  var _scrollListener = null;

  return {
    startRecording: function () {
      // Start scroll recording
      // DEBUG console.log('start scroll recording');
      var scrollerEl = document.getElementById('card-layer-content');

      _scrollListener = function () {
        // DEBUG console.log('scroll at', scrollerEl.scrollTop);
        _scrollPosition = scrollerEl.scrollTop;
      };

      scrollerEl.addEventListener('scroll', _scrollListener);
    },

    stopRecording: function () {
      // Stop scroll recording
      // DEBUG console.log('stop scroll recording');
      var scrollerEl = document.getElementById('card-layer-content');
      scrollerEl.removeEventListener('scroll', _scrollListener);
      _scrollListener = null;
    },

    applyScroll: function () {
      // Apply recorded scroll
      // DEBUG console.log('apply recorded scroll', _scrollPosition);
      var scrollerEl = document.getElementById('card-layer-content');
      scrollerEl.scrollTop = _scrollPosition;
    },
  };
};
