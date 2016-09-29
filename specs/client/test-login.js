
var io = require('socket.io-client');

casper.test.begin('Title test', 2, function suite(test) {
  casper.start('http://localhost:3000/', function () {
    test.assertHttpStatus(200);
    test.assertTitleMatch(/Subterranea/);
  });
  casper.run(function () {
    test.done();
  })
});

casper.test.begin('Login socket test', 1, function suite(test) {
  var socket = io('http://localhost:3000/');
  socket.emit('auth/login', {}, function (response) {
    test.assert(response.hasOwnProperty('error'));
    test.done();
  });
});
