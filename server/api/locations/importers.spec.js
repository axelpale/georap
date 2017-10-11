/* global describe, it, */
/* eslint-disable handle-callback-err */

var unit = require('./importers');
var should = require('should');  // eslint-disable-line no-unused-vars


describe('importers', function () {

  describe('.readKML', function () {

    it('should detect Placemark', function (done) {

      var xmlIn = '<?xml version="1.0" encoding="utf-8"?>' +
        '<kml xmlns="http://www.opengis.net/kml/2.2">' +
          '<Document>' +
            '<Placemark>' +
              '<name>Portland</name>' +
              '<Point>' +
                '<coordinates>-122.681944,45.52,0</coordinates>' +
              '</Point>' +
            '</Placemark>' +
          '</Document>' +
        '</kml>';

      unit.readKML(xmlIn, function (err, locs) {
        locs.should.deepEqual([
          {
            name: 'Portland',
            longitude: -122.681944,
            latitude: 45.52,
            descriptions: [],
            overlays: [],
          },
        ]);

        return done();
      });

    });

    it('should extract Folder', function (done) {

      var xmlIn = '<?xml version="1.0" encoding="utf-8"?>' +
        '<kml xmlns="http://www.opengis.net/kml/2.2">' +
          '<Document>' +
            '<Placemark>' +
              '<name>Rio de Janeiro</name>' +
              '<Point>' +
                '<coordinates>-43.196,-22.908,0</coordinates>' +
              '</Point>' +
            '</Placemark>' +
            '<Folder>' +
              '<GroundOverlay>' +
                '<name>Almeida</name>' +
                  '<description><![CDATA[<a>Source</a>]]></description>' +
                  '<Icon>' +
                    '<href>files/Almeida.jpg</href>' +
                    '<viewBoundScale>0.75</viewBoundScale>' +
                  '</Icon>' +
                  '<LatLonBox>' +
                    '<north>40.729</north>' +
                    '<south>40.722</south>' +
                    '<east>-6.900</east>' +
                    '<west>-6.912</west>' +
                    '<rotation>11.968</rotation>' +
                  '</LatLonBox>' +
              '</GroundOverlay>' +
              '<Placemark>' +
                '<name>Portland</name>' +
                '<description><![CDATA[1234]]></description>' +
                '<Point>' +
                  '<coordinates>-122.681,45.52,0</coordinates>' +
                '</Point>' +
              '</Placemark>' +
            '</Folder>' +
          '</Document>' +
        '</kml>';

      unit.readKML(xmlIn, function (err, locs) {
        locs.should.deepEqual([
          {
            name: 'Rio de Janeiro',
            latitude: -22.908,
            longitude: -43.196,
            descriptions: [],
            overlays: [],
          },
          {
            name: 'Portland',
            latitude: 45.52,
            longitude: -122.681,
            descriptions: ['1234'],
            overlays: [{
              name: 'Almeida',
              description: '<a>Source</a>',
              href: 'files/Almeida.jpg',
              viewBoundScale: 0.75,
              latLonBox: {
                north: 40.729,
                south: 40.722,
                east: -6.900,
                west: -6.912,
                rotation: 11.968,
              },
            }],
          },
        ]);

        return done();
      });

    });

  });

});
