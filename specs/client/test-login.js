/*eslint no-magic-numbers: "off"*/

casper.test.begin('Title test', 2, function suite(test) {
  casper.start('http://localhost:3000/', function () {
    test.assertHttpStatus(200);
    test.assertTitleMatch(/Subterranea/);
  });
  casper.run(function () {
    test.done();
  })
});
