/* global describe, it */
/* eslint-disable no-magic-numbers */

var assert = require('assert');

var Ajv = require('ajv');
var validator = new Ajv();

// Use locations in the fixture for tests.
var fixture = require('./fixtures/small');
var prepareForClient = require('./lib/prepareForClient');
var clone = require('clone');

var putSchema = require('./schemas/locations/put');
var locationSchema = require('./schemas/locations/location');
var geomSchema = require('./schemas/locations/geom');

var putVr = validator.compile(putSchema);
var locationVr = validator.compile(locationSchema);
var geomVr = validator.compile(geomSchema);

var validLocation = clone(fixture.collections.locations[0]);
prepareForClient.location(validLocation);

var idlessLocation = clone(validLocation);
delete idlessLocation._id;

var namelessLocation = clone(validLocation);
delete namelessLocation.name;


describe('server.handlers.schemas', function () {
  describe('.locations', function () {
    describe('.geom', function () {

      it('should detect valid point', function () {
        assert.ok(geomVr({
          type: 'Point',
          coordinates: [21.857705, 57.55341],
        }));
      });

      it('should detect invalid point', function () {
        assert.ok(!geomVr({
          coordinates: [21.857705, 57.55341],
        }));
        assert.ok(!geomVr(null));
        assert.ok(!geomVr({
          type: 'Pint',
          coordinates: [21.857705, 57.55341],
        }));
      });
    });

    describe('.location', function () {

      it('should allow valid location with _id', function () {
        assert.ok(locationVr(validLocation));
      });

      it('should prevent nameless valid location', function () {
        assert.ok(!locationVr(namelessLocation));
      });

      it('should allow valid location without _id', function () {
        assert.ok(locationVr(idlessLocation));
      });
    });

    describe('.put', function () {

      it('should detect valid put', function () {
        assert.ok(putVr({ location: validLocation }));
      });

      it('should detect invalid location', function () {
        assert.ok(!putVr(validLocation));
      });

    });

  });
});
