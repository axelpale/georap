module.exports = georap.createStore('location.viewmode', {
  viewMode: 'dense', // 'dense' | 'list'
}, function reducer(state, ev) {
  if (ev === 'dense') {
    return Object.assign({}, state, {
      viewMode: 'dense',
    });
  }
  if (ev === 'list') {
    return Object.assign({}, state, {
      viewMode: 'list',
    });
  }
});
