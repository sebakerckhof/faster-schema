/* eslint-disable func-names, prefer-arrow-callback */

import { expect } from 'chai';
import FasterSchema from './FasterSchema';
import Address from './testHelpers/Address';

class Constructable {}

const fs = new FasterSchema({
  string: {
    type: String,
    optional: true,
  },
  minMaxString: {
    type: String,
    optional: true,
    min: 10,
    max: 20,
    regEx: /^[a-z0-9_]+$/,
  },
  minMaxStringArray: {
    type: Array,
    optional: true,
    minCount: 1,
    maxCount: 2,
  },
  'minMaxStringArray.$': {
    type: String,
    min: 10,
    max: 20,
  },
  allowedStrings: {
    type: String,
    optional: true,
    allowedValues: ['tuna', 'fish', 'salad'],
  },
  allowedStringsArray: {
    type: Array,
    optional: true,
  },
  'allowedStringsArray.$': {
    type: String,
    allowedValues: ['tuna', 'fish', 'salad'],
  },
  boolean: {
    type: Boolean,
    optional: true,
  },
  booleanArray: {
    type: Array,
    optional: true,
  },
  'booleanArray.$': {
    type: Boolean,
  },
  number: {
    type: Number,
    optional: true,
  },
  sub: {
    type: Object,
    optional: true,
  },
  'sub.number': {
    type: Number,
    optional: true,
  },
  minMaxNumber: {
    type: Number,
    optional: true,
    min: 10,
    max: 20,
  },
  minZero: {
    type: Number,
    optional: true,
    min: 0,
  },
  maxZero: {
    type: Number,
    optional: true,
    max: 0,
  },
  minMaxNumberCalculated: {
    type: Number,
    optional: true,
    min() {
      return 10;
    },
    max() {
      return 20;
    },
  },
  minMaxNumberExclusive: {
    type: Number,
    optional: true,
    min: 10,
    max: 20,
    exclusiveMax: true,
    exclusiveMin: true,
  },
  minMaxNumberInclusive: {
    type: Number,
    optional: true,
    min: 10,
    max: 20,
    exclusiveMax: false,
    exclusiveMin: false,
  },
  allowedNumbers: {
    type: Number,
    optional: true,
    allowedValues: [1, 2, 3],
  },
  allowedNumbersArray: {
    type: Array,
    optional: true,
  },
  'allowedNumbersArray.$': {
    type: Number,
    allowedValues: [1, 2, 3],
  },
  decimal: {
    type: Number,
    optional: true,
  },
  date: {
    type: Date,
    optional: true,
  },
  dateArray: {
    type: Array,
    optional: true,
  },
  'dateArray.$': {
    type: Date,
  },
  minMaxDate: {
    type: Date,
    optional: true,
    min: (new Date(Date.UTC(2013, 0, 1))),
    max: (new Date(Date.UTC(2013, 11, 31))),
  },
  minMaxDateCalculated: {
    type: Date,
    optional: true,
    min() {
      return (new Date(Date.UTC(2013, 0, 1)));
    },
    max() {
      return (new Date(Date.UTC(2013, 11, 31)));
    },
  },
  email: {
    type: String,
    regEx: FasterSchema.RegEx.Email,
    optional: true,
  },
  url: {
    type: String,
    regEx: FasterSchema.RegEx.Url,
    optional: true,
  },
  customObject: {
    type: Address,
    optional: true,
    blackbox: true,
  },
  blackBoxObject: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  noTrimString: {
    type: String,
    optional: true,
    trim: false,
  },
});

function getTest(given, expected) {
  return function() {
    fs.clean(given, { mutate: true });
    expect(given).to.eql(expected);
  };
}

describe('clean', function () {
  describe('normal doc', function () {
    it('when you clean a good object it is still good', getTest({ string: 'This is a string' }, { string: 'This is a string' }));
    it('when you clean a bad object it is now good', getTest({ string: 'This is a string', admin: true }, { string: 'This is a string' }));
    it('type conversion works', getTest({ string: 1 }, { string: '1' }));
    it('remove empty strings', getTest({ string: '' }, {}));
    it('remove whitespace only strings (trimmed to empty strings)', getTest({ string: '    ' }, {}));

    const myObj = new Address('New York', 'NY');
    it('when you clean a good custom object it is still good', getTest({ customObject: myObj }, { customObject: myObj }));

    const myObj2 = {
      foo: 'bar',
      'foobar.foobar': 10000,
    };
    it('when you clean a good blackbox object it is still good', getTest({ blackBoxObject: myObj2 }, { blackBoxObject: myObj2 }));

    const myObj3 = {
      string: 't',
      length: 5,
    };
    it('when you clean an object with a length property, the length property should be removed', getTest(myObj3, { string: 't' }));

    const myObj4 = {
      string: 't',
      length: null,
    };
    it('when you clean an object with a length null, the length property should be removed', getTest(myObj4, { string: 't' }));
  });

  describe('blackbox', function () {
    // Cleaning shouldn't remove anything within blackbox
    it('1', getTest({ blackBoxObject: { foo: 1 } }, { blackBoxObject: { foo: 1 } }));
    it('2', getTest({ blackBoxObject: { foo: [1] } }, { blackBoxObject: { foo: [1] } }));
    it('3', getTest({ blackBoxObject: { foo: [{ bar: 1 }] } }, { blackBoxObject: { foo: [{ bar: 1 }] } }));
  });

  it('trim strings', function () {
    function doTest(given, expected) {
      const cleanObj = fs.clean(given, {
        mutate: true,
        filter: false,
        autoConvert: false,
        removeEmptyStrings: false,
        trimStrings: true,
        getAutoValues: false,
      });
      expect(cleanObj).to.eql(expected);
    }

    // DOC
    doTest({ string: '    This is a string    ' }, { string: 'This is a string' });
    // Trim false
    doTest({ noTrimString: '    This is a string    ' }, { noTrimString: '    This is a string    ' });

    // Trim false with autoConvert
    const cleanObj = fs.clean({ noTrimString: '    This is a string    ' }, {
      filter: false,
      autoConvert: true,
      removeEmptyStrings: false,
      trimStrings: true,
      getAutoValues: false,
      isModifier: false,
    });
    expect(cleanObj).to.eql({ noTrimString: '    This is a string    ' });
  });


  it('should respect filter option', () => {
    const schema = new FasterSchema({
      a: { type: String, defaultValue: 'x' },
    });

    expect(schema.clean({ b: 1 })).to.eql({ a: 'x' });
    expect(schema.clean({ b: 1 }, { filter: true })).to.eql({ a: 'x' });
    expect(schema.clean({ b: 1 }, { filter: false })).to.eql({ a: 'x', b: 1 });
  });

  it('should respect getAutoValues option', () => {
    const schema = new FasterSchema({
      a: { type: String, defaultValue: 'x' },
    });
    expect(schema.clean({ b: 1 })).to.eql({ a: 'x' });
    expect(schema.clean({ b: 1 }, { getAutoValues: true })).to.eql({ a: 'x' });
    expect(schema.clean({ b: 1 }, { getAutoValues: false })).to.eql({});
  });

  describe('miscellaneous', function () {
    it('type convert to array', function () {
      const myObj1 = { allowedStringsArray: 'tuna' };
      fs.clean(myObj1, { mutate: true });
      expect(myObj1).to.eql({ allowedStringsArray: ['tuna'] });
    });

    it('clean incorrect array values', function () {
      const myObj1 = { allowedStringsArray: ['tuna', 'sardine'] };
      fs.clean(myObj1, { mutate: true });
      expect(myObj1).to.eql({ allowedStringsArray: ['tuna'] });
    });

    it('multi-dimensional arrays', function () {
      const schema = new FasterSchema({
        geometry: {
          type: Object,
          optional: true,
        },
        'geometry.coordinates': {
          type: Array,
        },
        'geometry.coordinates.$': {
          type: Array,
        },
        'geometry.coordinates.$.$': {
          type: Array,
        },
        'geometry.coordinates.$.$.$': {
          type: Number,
        },
      });

      const doc = {
        geometry: {
          coordinates: [
            [
              [30, 50],
            ],
          ],
        },
      };

      const expected = JSON.stringify(doc);
      expect(JSON.stringify(schema.clean(doc))).to.eql(expected);
    });

    it('removeNullsFromArrays removes nulls from arrays', function () {
      const schema = new FasterSchema({
        names: Array,
        'names.$': String,
      });

      const cleanedObject = schema.clean({
        names: [null, 'foo', null],
      }, { removeNullsFromArrays: true });

      expect(cleanedObject).to.eql({
        names: ['foo'],
      });
    });

    it('remove object', function () {
      const schema = new FasterSchema({
        names: { type: Array },
        'names.$': { type: String },
      });

      const doc = {
        names: [{ hello: 'world' }],
      };
      schema.clean(doc, { mutate: true });
      expect(doc).to.eql({
        names: [],
      });
    });
  });

  it('should clean sub schemas', function () {
    const doubleNestedSchema = new FasterSchema({
      integer: Number,
    });

    const nestedSchema = new FasterSchema({
      doubleNested: doubleNestedSchema,
    });

    const schema = new FasterSchema({
      nested: Array,
      'nested.$': nestedSchema,
    });

    const cleanedObject = schema.clean({
      nested: [{
        doubleNested: {
          integer: '1',
        },
      }],
    });
    expect(cleanedObject).to.eql({
      nested: [{
        doubleNested: {
          integer: 1,
        },
      }],
    });
  });

  it('should clean object type', function () {
    const scheme = new FasterSchema({
      ob: {
        type: Object,
        autoValue({ value }) {
          return value || {};
        },
      },
      'ob._id': {
        type: String,
      },
    });

    const cleanObject = scheme.clean({ ob: 'test' });
    expect(cleanObject).to.eql({ ob: {} });
  });

  it('should not remove Constructable', function () {
    const scheme = new FasterSchema({
      data: Constructable,
    });

    const cleanObject = scheme.clean({ data: new Constructable() });
    expect(cleanObject.data).to.exist;
    expect(cleanObject.data.constructor.name).to.equal('Constructable');
  });

  it('should remove object if not of the same instance', function () {
    const scheme = new FasterSchema({
      data: Constructable,
    });

    const cleanObject = scheme.clean({ data: {} });
    expect(cleanObject.data).to.not.exist;
  });

  it('should not convert undefined to an array', function () {
    const scheme = new FasterSchema({
      data: {
        type: Array,
      },
    });

    const cleanObject = scheme.clean({ data: {} });
    expect(cleanObject.data).to.not.exist;
  });

  it('should work with arraybuffer', function () {
    const scheme = new FasterSchema({
      data: ArrayBuffer,
    });

    const cleanObject = scheme.clean({ data: new ArrayBuffer() });
    expect(cleanObject.data).to.exist;
    expect(cleanObject.data.constructor.name).to.equal('ArrayBuffer');
  });
});
