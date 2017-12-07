/* eslint-disable func-names, prefer-arrow-callback */
import { expect } from 'chai';
import FasterSchema, { ErrorTypes } from './FasterSchema';
import testSchema from './testHelpers/testSchema';
import expectValid from './testHelpers/expectValid';
import expectErrorOfTypeLength from './testHelpers/expectErrorOfTypeLength';

class CustomObject {
  constructor(obj) {
    Object.assign(this, obj);
  }

  bar() { //eslint-disable-line
    return 20;
  }
}

describe('FasterSchema', function () {
  it('throws error if a key is missing type', function () {
    expect(function () {
      return new FasterSchema({
        foo: {},
      });
    }).to.throw('foo key is missing "type"');
  });

  it('throws an explicit error if you define fields that override object methods', function () {
    expect(function () {
      return new FasterSchema({
        valueOf: {
          type: String,
        },
      });
    }).to.throw('valueOf key is actually the name of a method on Object');
  });

  describe('nesting', function () {
    it('throws an error if a nested schema defines a field that its parent also defines', function () {
      expect(function () {
        return new FasterSchema({
          foo: new FasterSchema({
            bar: String,
          }),
          'foo.bar': String,
        });
      }).to.throw();
    });

    it('expects a field with FasterSchema type to be an object', function () {
      const schema = new FasterSchema({
        foo: new FasterSchema({
          bar: String,
        }),
      });

      const context = schema.newContext();
      context.validate({
        foo: 'string',
      });

      expect(context.validationErrors()).to.eql([
        {
          dataType: 'Object',
          name: 'foo',
          label: 'Foo',
          type: ErrorTypes.EXPECTED_TYPE,
          value: 'string',
        },
      ]);
    });

    it('includes type validation errors from nested schemas', function () {
      const schema = new FasterSchema({
        foo: new FasterSchema({
          bar: String,
        }),
      });

      const context = schema.newContext();
      context.validate({
        foo: {
          bar: 12345,
        },
      });

      expect(context.validationErrors()).to.eql([
        {
          dataType: 'String',
          name: 'foo.bar',
          label: 'Bar',
          type: ErrorTypes.EXPECTED_TYPE,
          value: 12345,
        },
      ]);
    });

    it('includes allowed value validation errors from nested schemas', function () {
      const schema = new FasterSchema({
        foo: new FasterSchema({
          bar: {
            type: String,
            allowedValues: ['hot'],
          },
        }),
      });

      const context = schema.newContext();
      context.validate({
        foo: {
          bar: 'cold',
        },
      });

      expect(context.validationErrors()).to.eql([
        {
          name: 'foo.bar',
          label: 'Bar',
          type: ErrorTypes.VALUE_NOT_ALLOWED,
          value: 'cold',
        },
      ]);
    });

    it('validates nested requiredness', function () {
      const schema = new FasterSchema({
        a: {
          type: new FasterSchema({
            b: {
              type: new FasterSchema({
                c: {
                  type: String,
                },
              }),
            },
          }),
        },
      });

      let context = schema.newContext();
      context.validate({ a: {} });

      expect(context.validationErrors()).to.eql([
        {
          name: 'a.b',
          label: 'B',
          type: ErrorTypes.REQUIRED,
        },
      ]);

      context = schema.newContext();
      context.validate({ a: { b: {} } });

      expect(context.validationErrors()).to.eql([
        {
          name: 'a.b.c',
          label: 'C',
          type: ErrorTypes.REQUIRED,
        },
      ]);
    });
  });

  describe('extracting', function() {
    it('omits', function () {
      const schema = new FasterSchema({
        foo: { type: Object },
        'foo.bar': { type: String },
        fooArray: { type: Array },
        'fooArray.$': { type: Object },
        'fooArray.$.bar': { type: String },
      });

      let newSchema = schema.omit('foo.*');
      expect(Object.keys(newSchema._compiled.definitions)).to.eql(['fooArray', 'fooArray.$', 'fooArray.$.bar']);

      newSchema = schema.omit('fooArray.*');
      expect(Object.keys(newSchema._compiled.definitions)).to.eql(['foo', 'foo.bar']);

      newSchema = schema.omit('foo.*', 'fooArray.*');
      expect(Object.keys(newSchema._compiled.definitions)).to.eql([]);

      newSchema = schema.omit('blah');
      expect(Object.keys(newSchema._compiled.definitions)).to.eql(['foo', 'fooArray', 'foo.bar', 'fooArray.$', 'fooArray.$.bar']);
    });

    it('picks', function () {
      const schema = new FasterSchema({
        foo: { type: Object },
        'foo.bar': { type: String },
        fooArray: { type: Array },
        'fooArray.$': { type: Object },
        'fooArray.$.bar': { type: String },
      });

      let newSchema = schema.pick('foo.*');
      expect(Object.keys(newSchema._compiled.definitions)).to.eql(['foo', 'foo.bar']);

      newSchema = schema.pick('fooArray.*');
      expect(Object.keys(newSchema._compiled.definitions)).to.eql(['fooArray', 'fooArray.$', 'fooArray.$.bar']);

      newSchema = schema.pick('foo.*', 'fooArray.*');
      expect(Object.keys(newSchema._compiled.definitions)).to.eql(['foo', 'fooArray', 'foo.bar', 'fooArray.$', 'fooArray.$.bar']);

      newSchema = schema.pick('blah');
      expect(Object.keys(newSchema._compiled.definitions)).to.eql([]);
    });
  });

  describe('shorthands', function() {
    it('supports shorthands', function() {
      const shortForm = new FasterSchema({
        foo: 'number?',
        bar: [['string']],
        baz: {
          type: ['string'],
        },
      });
      const longForm = new FasterSchema({
        foo: {
          type: 'number',
          optional: true,
        },
        bar: {
          type: 'array',
        },
        'bar.$': {
          type: 'array',
        },
        'bar.$.$': {
          type: 'string',
        },
        baz: {
          type: 'array',
        },
        'baz.$': {
          type: 'string',
        },
      });

      expect(shortForm._compiled.definitions).to.eql(longForm._compiled.definitions);
    });

    it('supports simpleschema shorthands', function() {
      const shortForm = new FasterSchema({
        foo: Number,
        bar: [String],
      });
      const longForm = new FasterSchema({
        foo: {
          type: 'number',
        },
        bar: {
          type: 'array',
        },
        'bar.$': {
          type: 'string',
        },
      });

      expect(shortForm._compiled.definitions).to.eql(longForm._compiled.definitions);
    });
  });

  it('validate object with prototype', function () {
    const schema = new FasterSchema({
      foo: { type: Number },
    });

    const testObj = new CustomObject({ foo: 1 });

    const context = schema.namedContext();
    expect(context.validate(testObj)).to.equal(true);
    expect(testObj instanceof CustomObject).to.equal(true);

    testObj.foo = 'not a number';
    expect(context.validate(testObj)).to.equal(false);
  });

  it('validate object with prototype within normal object', function () {
    const schema = new FasterSchema({
      customObject: Object,
      'customObject.foo': Number,
    });

    const customObject = new CustomObject({ foo: 1 });
    const testObj = {
      customObject,
    };

    const context = schema.namedContext();
    expect(context.validate(testObj)).to.equal(true);
    expect(testObj.customObject instanceof CustomObject).to.equal(true);

    testObj.customObject.foo = 'not a number';
    expect(context.validate(testObj)).to.equal(false);
  });

  it('allowsKey', function () {
    function run(key, allowed) {
      expect(testSchema.allowsKey(key)).to.equal(allowed);
    }

    run('minMaxString', true);
    run('minMaxString.$', false);
    run('minMaxString.$.foo', false);
    run('minMaxString.$foo', false);
    run('minMaxString.foo', false);
    run('sub', true);
    run('sub.number', true);
    run('sub.number.$', false);
    run('sub.number.$.foo', false);
    run('sub.number.$foo', false);
    run('sub.number.foo', false);
    run('minMaxStringArray', true);
    run('minMaxStringArray.$', true);
    run('minMaxStringArray.$.foo', false);
    run('minMaxStringArray.foo', false);
    run('customObject', true);
    run('customObject.$', false);
    run('customObject.foo', true);
    run('customObject.foo.$', true);
    run('customObject.foo.$foo', true);
    run('customObject.foo.$.$foo', true);
    run('blackBoxObject', true);
    run('blackBoxObject.$', false);
    run('blackBoxObject.foo', true);
    run('blackBoxObject.foo.$', true);
    run('blackBoxObject.foo.$foo', true);
    run('blackBoxObject.foo.$.$foo', true);
    run('blackBoxObject.foo.bar.$.baz', true);
  });

  it('allowsKey in subschema', function () {
    const schema = new FasterSchema({
      foo: new FasterSchema({
        bar: Object,
        'bar.baz': String,
      }),
    });

    expect(schema.allowsKey('foo.bar')).to.equal(true);
    expect(schema.allowsKey('foo.bar.baz')).to.equal(true);
    expect(schema.allowsKey('foo.bar.bum')).to.equal(false);
    expect(schema.allowsKey('foo.bar.baz.bum')).to.equal(false);
  });

  it('validating an object with a "length" property should not error', function () {
    const schema = new FasterSchema({
      length: {
        type: Number,
        optional: true,
      },
    });

    expect(() => {
      schema.validate({
        length: 10,
      });
    }).to.not.throw();
  });

  it('keyIsInBlackBox in subschema', function () {
    const schema = new FasterSchema({
      foo: new FasterSchema({
        bar: {
          type: Object,
          blackbox: true,
        },
      }),
    });

    expect(schema.keyIsInBlackBox('foo.bar')).to.equal(false);
    expect(schema.keyIsInBlackBox('foo.bar.baz')).to.equal(true);
    expect(schema.keyIsInBlackBox('foo.bar.baz.$.bum')).to.equal(true);
  });

  describe('blackboxKeys from subschema', function () {
    it('are correct', function () {
      const schema = new FasterSchema({
        apple: {
          type: Object,
          blackbox: true,
        },
        pear: new FasterSchema({
          info: {
            type: Object,
            blackbox: true,
          },
        }),
      });

      expect(schema.blackboxKeys()).to.eql(['apple', 'pear.info']);
    });
  });

  describe('fields', function () {
    it('works returns the fields, flattened and generic', function () {
      const schema = new FasterSchema({
        firstName: {
          type: String,
          label: 'First name',
          optional: false,
        },
        email: {
          type: [String],
        },
      });
      expect(schema.fields()).to.eql(['firstName', 'email', 'email.$']);
    });
  });

  describe('merge', function () {
    it('works for 2 schemas', function () {
      const schema = new FasterSchema({
        firstName: {
          type: String,
          label: 'First name',
          optional: false,
        },
        lastName: {
          type: String,
          label: 'Last name',
          optional: false,
        },
      });

      const schema2 = new FasterSchema({
        foo: 'string',
      });

      expect(FasterSchema.merge(schema, schema2).fields()).to.eql(['firstName', 'lastName', 'foo']);
    });

    it('works for normal objects', function () {
      const schema = {
        firstName: {
          type: String,
          label: 'First name',
          optional: false,
        },
        lastName: {
          type: String,
          label: 'Last name',
          optional: false,
        },
      };

      const schema2 = {
        foo: 'string',
      };
      expect(FasterSchema.merge(schema, schema2).fields()).to.eql(['firstName', 'lastName', 'foo']);
    });

    it('works for combinations', function () {
      const schema = {
        firstName: {
          type: String,
          label: 'First name',
          optional: false,
        },
        lastName: {
          type: String,
          label: 'Last name',
          optional: false,
        },
      };

      const schema2 = new FasterSchema({
        foo: 'string',
      });
      expect(FasterSchema.merge(schema, schema2).fields()).to.eql(['firstName', 'lastName', 'foo']);
    });

    it('works for empty arrays', function () {
      expect(() => FasterSchema.merge(...[])).to.not.throw();
    });
  });
  describe('extend', function () {
    it('works for plain object', function () {
      const schema = new FasterSchema({
        firstName: {
          type: String,
          label: 'First name',
          optional: false,
        },
        lastName: {
          type: String,
          label: 'Last name',
          optional: false,
        },
      });

      schema.extend({
        firstName: {
          optional: true,
        },
      });

      expect(schema.get('firstName', 'optional')).to.equal(true);
    });

    it('works for another FasterSchema instance and copies validators', function () {
      const schema1 = new FasterSchema({
        firstName: {
          type: String,
          label: 'First name',
          optional: false,
        },
        lastName: {
          type: String,
          label: 'Last name',
          optional: false,
        },
      });

      const schema2 = new FasterSchema({
        age: {
          type: Number,
          label: 'Age',
        },
      });
      schema2.addValidator(() => {});
      schema2.addDocValidator(() => {});

      schema1.extend(schema2);

      expect(Object.keys(schema1._compiled.definitions)).to.eql(['firstName', 'lastName', 'age']);
      expect(schema1._validators.length).to.equal(1);
      expect(schema1._docValidators.length).to.equal(1);
    });

    it('keeps both min and max', function () {
      const schema = new FasterSchema({
        name: {
          type: String,
          min: 5,
        },
      });
      schema.extend({
        name: {
          type: String,
          max: 15,
        },
      });

      expect(schema.get('name', 'min')).to.equal(5);
      expect(schema.get('name', 'max')).to.equal(15);
    });
  });

  it('empty required array is valid', function () {
    const schema = new FasterSchema({
      names: { type: Array },
      'names.$': { type: String },
    });

    expectValid(schema, {
      names: [],
    });
  });

  it('null in array is not valid', function () {
    const schema = new FasterSchema({
      names: { type: Array },
      'names.$': { type: String },
    });

    expectErrorOfTypeLength(ErrorTypes.EXPECTED_TYPE, schema, {
      names: [null],
    });
  });

  it('null is valid for optional', function () {
    const schema = new FasterSchema({
      test: { type: String, optional: true },
    });

    expectValid(schema, {
      test: null,
    });
  });

  it('issue 360', function () {
    const schema = new FasterSchema({
      emails: {
        type: Array,
      },
      'emails.$': {
        type: Object,
      },
      'emails.$.address': {
        type: String,
        regEx: FasterSchema.RegEx.Email,
      },
      'emails.$.verified': {
        type: Boolean,
      },
    });

    expectErrorOfTypeLength(ErrorTypes.EXPECTED_TYPE, schema, {
      emails: [
        {
          address: 12321,
          verified: 'asdasd',
        },
      ],
    }, { keys: ['emails'] }).to.equal(2);

    expectErrorOfTypeLength(ErrorTypes.EXPECTED_TYPE, schema, {
      emails: [
        {
          address: 12321,
          verified: 'asdasd',
        },
      ],
    }, { keys: ['emails.0'] }).to.equal(2);
  });

  it('ignore option', function () {
    const schema = new FasterSchema({
      foo: { type: String, optional: true },
    });

    expectValid(schema, {
      foo: 'bar',
    });

    expectValid(schema, {
      foo: 'bar',
    }, {
      ignore: [ErrorTypes.KEY_NOT_IN_SCHEMA],
    });

    expectValid(schema, {
      foo: 'bar',
    }, {
      keys: ['foo'],
      ignore: [ErrorTypes.KEY_NOT_IN_SCHEMA],
    });

    expectErrorOfTypeLength(ErrorTypes.KEY_NOT_IN_SCHEMA, schema, {
      bar: 'foo',
    });

    expectValid(schema, {
      bar: 'foo',
    }, {
      ignore: [ErrorTypes.KEY_NOT_IN_SCHEMA],
    });

    expectValid(schema, {
      bar: 'foo',
    }, {
      keys: ['bar'],
      ignore: [ErrorTypes.KEY_NOT_IN_SCHEMA],
    });
  });

  it('ClientError', function () {
    const schema = new FasterSchema({
      int: FasterSchema.Integer,
      string: String,
    });

    function verify(error) {
      expect(error.name).to.equal('ClientError');
      expect(error.errorType).to.equal('ClientError');
      expect(error.error).to.equal('validation-error');
      expect(error.details.length).to.equal(2);
      expect(error.details[0].name).to.equal('int');
      expect(error.details[0].type).to.equal(ErrorTypes.EXPECTED_TYPE);
      expect(error.details[0].message).to.equal('Int must be of type Integer');
      expect(error.details[1].name).to.equal('string');
      expect(error.details[1].type).to.equal(ErrorTypes.REQUIRED);
      expect(error.details[1].message).to.equal('String is required');

      // In order for the message at the top of the stack trace to be useful,
      // we set it to the first validation error message.
      expect(error.reason, 'Int must be of type Integer');
      expect(error.message, 'Int must be of type Integer [validation-error]');
    }

    try {
      schema.validate({ int: '5' });
    } catch (error) {
      verify(error);
    }

    try {
      FasterSchema.validate({ int: '5' }, schema);
    } catch (error) {
      verify(error);
    }

    try {
      FasterSchema.validate({ int: '5' }, {
        int: 'integer',
        string: String,
      });
    } catch (error) {
      verify(error);
    }

    try {
      schema.validator()({ int: '5' });
    } catch (error) {
      verify(error);
    }

    expect(function () {
      schema.validator({ clean: true })({ int: '5', string: 'test' });
    }).to.not.throw();
  });

  it('validate takes an array', function () {
    const schema = new FasterSchema({
      int: Number,
      string: String,
    });

    function verify(error) {
      expect(error.name).to.equal('ClientError');
      expect(error.errorType).to.equal('ClientError');
      expect(error.error).to.equal('validation-error');
      expect(error.details.length).to.equal(2);
      expect(error.details[0].name).to.equal('int');
      expect(error.details[0].type).to.equal(ErrorTypes.EXPECTED_TYPE);
      expect(error.details[1].name).to.equal('string');
      expect(error.details[1].type).to.equal(ErrorTypes.REQUIRED);

      // In order for the message at the top of the stack trace to be useful,
      // we set it to the first validation error message.
      expect(error.reason, 'Int must be of type Integer');
      expect(error.message, 'Int must be of type Integer [validation-error]');
    }

    try {
      schema.validate([{ int: 5, string: 'test' }, { int: '5' }]);
    } catch (error) {
      verify(error);
    }

    try {
      FasterSchema.validate([{ int: 5, string: 'test' }, { int: '5' }], schema);
    } catch (error) {
      verify(error);
    }

    try {
      FasterSchema.validate([{ int: 5, string: 'test' }, { int: '5' }], {
        int: Number,
        string: String,
      });
    } catch (error) {
      verify(error);
    }

    try {
      schema.validator()([{ int: 5, string: 'test' }, { int: '5' }]);
    } catch (error) {
      verify(error);
    }
  });

  it('validationErrorTransform', function () {
    const schema = new FasterSchema({
      string: String,
    });

    FasterSchema.defineValidationErrorTransform((error) => {
      error.message = 'validationErrorTransform';
      return error;
    });

    try {
      schema.validate({});
    } catch (e) {
      expect(e.message).to.equal('validationErrorTransform');
    }

    // Don't mess up other tests
    FasterSchema.validationErrorTransform = null;
  });

  it('FasterSchema.addDocValidator', function () {
    const schema = new FasterSchema({
      string: String,
    });

    const errorArray = [
      { name: 'firstName', type: 'TOO_SILLY', value: 'Reepicheep' },
    ];
    const validatedObject = {
      string: 'String',
    };

    FasterSchema.addDocValidator((obj) => {
      expect(obj).to.eql(validatedObject);
      return errorArray;
    });

    const context = schema.newContext();
    context.validate(validatedObject);

    expect(context.validationErrors()).to.eql(errorArray);

    // Don't mess up other tests
    FasterSchema._docValidators = [];
  });

  it('addDocValidator', function () {
    const schema = new FasterSchema({
      string: String,
    });

    const errorArray = [
      { name: 'firstName', type: 'TOO_SILLY', value: 'Reepicheep' },
    ];
    const validatedObject = {
      string: 'String',
    };

    schema.addDocValidator((obj) => {
      expect(obj).to.eql(validatedObject);
      return errorArray;
    });

    const context = schema.newContext();
    context.validate(validatedObject);

    expect(context.validationErrors()).to.eql(errorArray);
  });

  it('gets schema property by key', function () {
    const schema = new FasterSchema({
      a: {
        type: new FasterSchema({
          b: {
            type: new FasterSchema({
              c: {
                type: String,
                defaultValue: 'abc',
              },
            }),
            defaultValue: 'ab',
          },
          d: {
            type: Array,
            minCount: 0,
            maxCount: 3,
          },
        }),
      },
    });

    expect(schema.get('a', 'defaultValue')).to.equal(undefined);
    expect(schema.get('a.b', 'defaultValue')).to.equal('ab');
    expect(schema.get('a.d', 'maxCount')).to.equal(3);
  });

  it('exposes defaultValue for a key', function () {
    const schema = new FasterSchema({
      a: {
        type: new FasterSchema({
          b: {
            type: new FasterSchema({
              c: {
                type: String,
                defaultValue: 'abc',
              },
            }),
            defaultValue: 'ab',
          },
        }),
      },
    });

    expect(schema.defaultValue('a')).to.equal(undefined);
    expect(schema.defaultValue('a.b')).to.equal('ab');
    expect(schema.defaultValue('a.b.c')).to.equal('abc');
  });
});
