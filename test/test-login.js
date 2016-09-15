casper.test.begin('Title test', 1, function (test) {
  casper.start('http://localhost:3000/', function () {
    test.assertTitle('Subterranea')
  });
  casper.run(function () {
    test.done();
  })
});
