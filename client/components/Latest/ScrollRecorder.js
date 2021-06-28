var getScrollerEl = function () {
  var layerEl = document.getElementById('card-layer');
  return layerEl.querySelector('.card-layer-content');
};

module.exports = function ScrollRecorder() {
  var self = this;

  self.scrollPosition = 0;
  self.scrollListener = null;

  self.startRecording = function () {
    // Start scroll recording
    // DEBUG console.log('start scroll recording');
    var scrollerEl = getScrollerEl();

    self.scrollListener = function () {
      // DEBUG console.log('scroll at', scrollerEl.scrollTop);
      self.scrollPosition = scrollerEl.scrollTop;
    };

    scrollerEl.addEventListener('scroll', self.scrollListener);
  };

  self.stopRecording = function () {
    // Stop scroll recording
    // DEBUG console.log('stop scroll recording');
    var scrollerEl = getScrollerEl();
    scrollerEl.removeEventListener('scroll', self.scrollListener);
    self.scrollListener = null;
  };

  self.applyScroll = function () {
    // Apply recorded scroll
    // DEBUG console.log('apply recorded scroll', _scrollPosition);
    var scrollerEl = getScrollerEl();
    scrollerEl.scrollTop = self.scrollPosition;
  };
};
