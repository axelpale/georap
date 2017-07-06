/* global casper */
/* eslint no-magic-numbers: "off" */

casper.test.begin('Smoke test', 1, function suite(test) {
  casper.start('http://localhost:3000/', function () {
    test.assertHttpStatus(200);
    //test.assertTitleMatch(/Tresdb/);
  });
  casper.run(function () {
    test.done();
  });
});
