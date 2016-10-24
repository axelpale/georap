/* global describe, it, beforeEach */
/* eslint-disable no-magic-numbers */

// eslint-disable-next-line no-unused-vars
var should = require('should');
var assert = require('assert');

var ObjectID = require('mongodb').ObjectID;

// The Unit
var DensityList = require('../DensityList');

var oids = [
  new ObjectID('57e3c20596fa2b173927a000'),
  new ObjectID('57e3c20596fa2b173927a001'),
  new ObjectID('57e3c20596fa2b173927a002'),
  new ObjectID('57e3c20596fa2b173927a003'),
  new ObjectID('57e3c20596fa2b173927a004'),
];

// Test data
var fixture = [
  { _id: oids[0] },
  { _id: oids[1] },
  { _id: oids[2] },
  { _id: oids[3] },
  { _id: oids[4] },
];

describe('DensityList', function () {
  var dl;

  beforeEach(function () {
    dl = new DensityList(fixture.slice());
  });

  describe('popDensest', function () {

    it('should find the topmost non-null', function () {
      var a = dl.popDensest();
      var b = dl.popDensest();

      assert.ok(a._id.equals(oids[0]));
      assert.ok(b._id.equals(oids[1]));
    });

    it('should return null if empty', function () {
      dl.popDensest();
      dl.popDensest();
      dl.popDensest();
      dl.popDensest();
      dl.popDensest();

      var a = dl.popDensest();

      should(a).be.equal(null);
    });

  });

  describe('removeMultiple', function () {

    it('should remove multiple', function () {
      dl.removeMultiple([
        { _id: oids[0] },
        { _id: oids[2] },
        { _id: oids[4] },
      ]);
      dl.isEmpty().should.equal(false);

      var a = dl.popDensest();
      var b = dl.popDensest();

      assert.ok(a._id.equals(oids[1]));
      assert.ok(b._id.equals(oids[3]));
    });

    it('should be able to remove all', function () {
      dl.removeMultiple(fixture);
      dl.isEmpty().should.equal(true);
    });

  });
});
