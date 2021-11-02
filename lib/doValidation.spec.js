import { expect } from 'chai';
import expectErrorLength from './testHelpers/expectErrorLength';
import FasterSchema from './FasterSchema';
import friendsSchema from './testHelpers/friendsSchema';
import testSchema from './testHelpers/testSchema';
import requiredSchema from './testHelpers/requiredSchema';
import expectValid from './testHelpers/expectValid';
import expectRequiredErrorLength from './testHelpers/expectRequiredErrorLength';
import expectErrorOfTypeLength from './testHelpers/expectErrorOfTypeLength';

describe('FasterSchema - object', function () {
  const schema = new FasterSchema({
    plainObject: { type: Object },
  });

  it('should not allow array', function () {
    expectErrorOfTypeLength('expectedType', schema, {
      plainObject: [],
    }).to.equal(1);
  });

  it('should not allow date', function () {
    expectErrorOfTypeLength('expectedType', schema, {
      plainObject: new Date(),
    }).to.equal(1);
  });
});

const schema = new FasterSchema({
  blackBoxObject: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  blackBoxArray: {
    type: Array,
    optional: true,
    blackbox: true,
  },
});

describe('FasterSchema - blackbox', function () {
  it('allows an empty object', function () {
    expectErrorLength(schema, {
      blackBoxObject: {},
    }).to.equal(0);
  });

  it('allows an empty array', function () {
    expectErrorLength(schema, {
      blackBoxArray: [],
    }).to.equal(0);
  });

  it('allows any properties', function () {
    expectErrorLength(schema, {
      blackBoxObject: {
        foo: 'bar',
      },
    }).to.equal(0);
  });

  it('allows any children', function () {
    expectErrorLength(schema, {
      blackBoxArray: [{ foo: 'bar' }, 'foo', 1],
    }).to.equal(0);
  });
});

describe('FasterSchema - allowedValues', function () {
  describe('normal', function () {
    it('valid string', function () {
      expectErrorLength(testSchema, {
        allowedStrings: 'tuna',
      }).to.equal(0);

      expectErrorLength(testSchema, {
        allowedStringsArray: ['tuna', 'fish', 'salad'],
      }).to.equal(0);

      // Array of objects
      expectErrorLength(friendsSchema, {
        friends: [{
          name: 'Bob',
          type: 'best',
        }],
        enemies: [],
      }).to.equal(0);
    });

    it('invalid string', function () {
      expectErrorLength(testSchema, {
        allowedStrings: 'tunas',
      }).to.equal(1);

      // Array
      expectErrorLength(testSchema, {
        allowedStringsArray: ['tuna', 'fish', 'sandwich'],
      }).to.equal(1);

      // Array of objects
      expectErrorLength(friendsSchema, {
        friends: [{
          name: 'Bob',
          type: 'smelly',
        }],
        enemies: [],
      }).to.equal(1);
    });

    it('valid number', function () {
      expectErrorLength(testSchema, {
        allowedNumbers: 1,
      }).to.equal(0);

      expectErrorLength(testSchema, {
        allowedNumbersArray: [1, 2, 3],
      }).to.equal(0);

      // Array of objects
      expectErrorLength(friendsSchema, {
        friends: [{
          name: 'Bob',
          type: 'best',
          a: {
            b: 5000,
          },
        }],
        enemies: [],
      }).to.equal(0);
    });

    it('invalid number', function () {
      expectErrorLength(testSchema, {
        allowedNumbers: 4,
      }).to.equal(1);

      // Array
      expectErrorLength(testSchema, {
        allowedNumbersArray: [1, 2, 3, 4],
      }).to.equal(1);

      // Array of objects
      expectErrorLength(friendsSchema, {
        friends: [{
          name: 'Bob',
          type: 'best',
          a: {
            b: 'wrong',
          },
        }],
        enemies: [],
      }).to.equal(1);
    });
  });

  describe('getAllowedValuesForKey', function () {
    it('works', function () {
      const allowedValues = ['a', 'b'];
      const fs = new FasterSchema({
        foo: Array,
        'foo.$': {
          type: String,
          allowedValues,
        },
      });
      expect(fs.getAllowedValuesForKey('foo.$')).to.eql(allowedValues);
    });
  });
});

describe('RegExp validation', function () {
  it('regEx - issue 409', function () {
    // Make sure no regEx errors for optional
    const fs = new FasterSchema({
      foo: {
        type: String,
        optional: true,
        regEx: /bar/,
      },
    });

    expect(fs.newContext().validate({})).to.be.true;
    expect(fs.newContext().validate({ foo: null })).to.be.true;
    expect(fs.newContext().validate({ foo: '' })).to.be.false;
  });

  it('Built-In RegEx and Messages', function () {
    const fs = new FasterSchema({
      email: {
        type: String,
        regEx: FasterSchema.RegEx.Email,
        optional: true,
      },
      emailWithTLD: {
        type: String,
        regEx: FasterSchema.RegEx.EmailWithTLD,
        optional: true,
      },
      domain: {
        type: String,
        regEx: FasterSchema.RegEx.Domain,
        optional: true,
      },
      weakDomain: {
        type: String,
        regEx: FasterSchema.RegEx.WeakDomain,
        optional: true,
      },
      ip: {
        type: String,
        regEx: FasterSchema.RegEx.IP,
        optional: true,
      },
      ip4: {
        type: String,
        regEx: FasterSchema.RegEx.IPv4,
        optional: true,
      },
      ip6: {
        type: String,
        regEx: FasterSchema.RegEx.IPv6,
        optional: true,
      },
      url: {
        type: String,
        regEx: FasterSchema.RegEx.Url,
        optional: true,
      },
      id: {
        type: String,
        regEx: FasterSchema.RegEx.Id,
        optional: true,
      },
    });

    const c1 = fs.newContext();
    c1.validate({
      email: 'foo',
    });
    expect(c1.validationErrors().length).to.equal(1);
    expect(c1.keyErrorMessage('email')).to.equal('Email must be a valid email address');

    c1.validate({
      emailWithTLD: 'foo',
    });
    expect(c1.validationErrors().length).to.equal(1);
    expect(c1.keyErrorMessage('emailWithTLD')).to.equal('Email with tld must be a valid email address');

    c1.validate({
      domain: 'foo',
    });
    expect(c1.validationErrors().length).to.equal(1);
    expect(c1.keyErrorMessage('domain')).to.equal('Domain must be a valid domain');

    c1.validate({
      weakDomain: '///jioh779&%',
    });
    expect(c1.validationErrors().length).to.equal(1);
    expect(c1.keyErrorMessage('weakDomain')).to.equal('Weak domain must be a valid domain');

    c1.validate({
      ip: 'foo',
    });
    expect(c1.validationErrors().length).to.equal(1);
    expect(c1.keyErrorMessage('ip')).to.equal('Ip must be a valid IPv4 or IPv6 address');

    c1.validate({
      ip4: 'foo',
    });
    expect(c1.validationErrors().length).to.equal(1);
    expect(c1.keyErrorMessage('ip4')).to.equal('Ip4 must be a valid IPv4 address');

    c1.validate({
      ip6: 'foo',
    });
    expect(c1.validationErrors().length).to.equal(1);
    expect(c1.keyErrorMessage('ip6')).to.equal('Ip6 must be a valid IPv6 address');

    c1.validate({
      url: 'foo',
    });
    expect(c1.validationErrors().length).to.equal(1);
    expect(c1.keyErrorMessage('url')).to.equal('Url must be a valid URL');

    c1.validate({
      id: '%#$%',
    });
    expect(c1.validationErrors().length).to.equal(1);
    expect(c1.keyErrorMessage('id')).to.equal('ID must be a valid alphanumeric ID');
  });

  it('Optional regEx in subobject', function () {
    const fs = new FasterSchema({
      foo: {
        type: Object,
        optional: true,
      },
      'foo.url': {
        type: String,
        regEx: FasterSchema.RegEx.Url,
        optional: true,
      },
    });

    const context = fs.namedContext();

    expect(context.validate({})).to.equal(true);

    expect(context.validate({
      foo: {},
    })).to.equal(true);

    expect(context.validate({
      foo: {
        url: null,
      },
    })).to.equal(true);
  });
});

describe('FasterSchema - min', function () {
  describe('normal', function () {
    it('string', function () {
      expectErrorLength(testSchema, {
        minMaxString: 'longenough',
      }).to.equal(0);

      expectErrorLength(testSchema, {
        minMaxString: 'short',
      }).to.equal(1);

      expectErrorLength(testSchema, {
        minMaxString: '',
      }).to.equal(1);

      expectErrorLength(testSchema, {
        minMaxStringArray: ['longenough', 'longenough'],
      }).to.equal(0);

      expectErrorLength(testSchema, {
        minMaxStringArray: ['longenough', 'short'],
      }).to.equal(1);

      expectErrorLength(testSchema, {
        minMaxStringArray: ['short', 'short'],
      }).to.equal(2);
    });

    it('number', function () {
      expectErrorLength(testSchema, {
        minMaxNumberExclusive: 20,
      }).to.equal(1);

      expectErrorLength(testSchema, {
        minMaxNumberExclusive: 10,
      }).to.equal(1);

      expectErrorLength(testSchema, {
        minMaxNumberInclusive: 20,
      }).to.equal(0);

      expectErrorLength(testSchema, {
        minMaxNumberInclusive: 10,
      }).to.equal(0);

      expectErrorLength(testSchema, {
        minMaxNumber: 10,
      }).to.equal(0);

      expectErrorLength(testSchema, {
        minMaxNumber: 9,
      }).to.equal(1);

      expectErrorLength(testSchema, {
        minZero: -1,
      }).to.equal(1);
    });

    it('date', function () {
      expectErrorLength(testSchema, {
        minMaxDate: (new Date(Date.UTC(2013, 0, 1))),
      }).to.equal(0);

      expectErrorLength(testSchema, {
        minMaxDate: (new Date(Date.UTC(2012, 11, 31))),
      }).to.equal(1);
    });
  });
});

describe('FasterSchema - minCount', function () {
  it('ensures array count is at least the minimum', function () {
    expectErrorLength(friendsSchema, {
      friends: [],
      enemies: [],
    }).to.equal(1);
  });
});

describe('FasterSchema - max', function () {
  describe('normal', function () {
    it('string', function () {
      expectErrorLength(testSchema, {
        minMaxString: 'nottoolongnottoolong',
      }).to.equal(0);

      expectErrorLength(testSchema, {
        minMaxString: 'toolongtoolongtoolong',
      }).to.equal(1);

      expectErrorLength(testSchema, {
        minMaxStringArray: ['nottoolongnottoolong', 'nottoolongnottoolong'],
      }).to.equal(0);

      expectErrorLength(testSchema, {
        minMaxStringArray: ['toolongtoolongtoolong', 'toolongtoolongtoolong'],
      }).to.equal(2);

      expectErrorLength(testSchema, {
        minMaxStringArray: ['nottoolongnottoolong', 'nottoolongnottoolong', 'nottoolongnottoolong'],
      }).to.equal(1);
    });

    it('number', function () {
      expectErrorLength(testSchema, {
        minMaxNumber: 20,
      }).to.equal(0);

      expectErrorLength(testSchema, {
        minMaxNumber: 21,
      }).to.equal(1);
    });

    it('date', function () {
      expectErrorLength(testSchema, {
        minMaxDate: (new Date(Date.UTC(2013, 11, 31))),
      }).to.equal(0);

      expectErrorLength(testSchema, {
        minMaxDate: (new Date(Date.UTC(2014, 0, 1))),
      }).to.equal(1);
    });
  });
});

describe('FasterSchema - required', function () {
  describe('normal', function () {
    it('valid', function () {
      expectValid(requiredSchema, {
        requiredString: 'test',
        requiredBoolean: true,
        requiredNumber: 1,
        requiredDate: new Date(),
        requiredEmail: 'test123@sub.example.edu',
        requiredUrl: 'http://google.com',
        requiredObject: {
          requiredNumber: 1,
        },
        optionalObject: {
          requiredString: 'test',
        },
      });

      expectValid(requiredSchema, {
        requiredString: 'test',
        requiredBoolean: true,
        requiredNumber: 1,
        requiredDate: new Date(),
        requiredEmail: 'test123@sub.example.edu',
        requiredUrl: 'http://google.com',
        requiredObject: {
          requiredNumber: 1,
        },
      });
    });

    it('invalid', function () {
      expectRequiredErrorLength(requiredSchema, {}).to.equal(7);

      expectRequiredErrorLength(requiredSchema, {
        requiredString: null,
        requiredBoolean: null,
        requiredNumber: null,
        requiredDate: null,
        requiredEmail: null,
        requiredUrl: null,
        requiredObject: null,
        optionalObject: {
          requiredString: null,
        },
      }).to.equal(8);

      expectRequiredErrorLength(requiredSchema, {
        requiredString: null,
        requiredBoolean: null,
        requiredNumber: null,
        requiredDate: null,
        requiredEmail: null,
        requiredUrl: null,
        requiredObject: null,
        optionalObject: {},
      }).to.equal(8);

      // we should not get an error about optionalObject.requiredString because the whole object is null
      expectRequiredErrorLength(requiredSchema, {
        requiredString: null,
        requiredBoolean: null,
        requiredNumber: null,
        requiredDate: null,
        requiredEmail: null,
        requiredUrl: null,
        requiredObject: null,
        optionalObject: null,
      }).to.equal(7);

      // we should not get an error about optionalObject.requiredString because the whole object is missing
      expectRequiredErrorLength(requiredSchema, {
        requiredString: null,
        requiredBoolean: null,
        requiredNumber: null,
        requiredDate: null,
        requiredEmail: null,
        requiredUrl: null,
        requiredObject: null,
      }).to.equal(7);

      expectRequiredErrorLength(requiredSchema, {
        requiredString: undefined,
        requiredBoolean: undefined,
        requiredNumber: undefined,
        requiredDate: undefined,
        requiredEmail: undefined,
        requiredUrl: undefined,
        requiredObject: undefined,
        optionalObject: {
          requiredString: undefined,
        },
      }).to.equal(8);

      expectRequiredErrorLength(requiredSchema, {
        requiredString: '',
        requiredBoolean: null,
        requiredNumber: null,
        requiredDate: null,
        requiredEmail: null,
        requiredUrl: null,
        requiredObject: null,
        optionalObject: {
          requiredString: '',
        },
      }).to.equal(6);

      expectRequiredErrorLength(requiredSchema, {
        requiredString: '   ',
        requiredBoolean: null,
        requiredNumber: null,
        requiredDate: null,
        requiredEmail: null,
        requiredUrl: null,
        requiredObject: null,
        optionalObject: {
          requiredString: '   ',
        },
      }).to.equal(6);

      // Array of objects
      expectRequiredErrorLength(friendsSchema, {
        friends: [{
          name: 'Bob',
        }],
        enemies: [{}],
      }).to.equal(2);
    });
  });

  it('requiredByDefault false', function () {
    const fs = new FasterSchema({ foo: String }, { requiredByDefault: false });
    expectRequiredErrorLength(fs, {}).to.equal(0);
  });

  it('required option', function () {
    const fs = new FasterSchema({
      foo: { type: String, required: true },
    }, { requiredByDefault: false });
    expectRequiredErrorLength(fs, {}).to.equal(1);
  });
});

describe('SimpleSchema - Validation Against Another Key', function () {
  const customSchema = new FasterSchema({
    password: {
      type: String,
    },
    confirmPassword: {
      type: String,
      custom({ value, parentObj }) {
        if (value !== parentObj.password) {
          return 'passwordMismatch';
        }
      },
    },
  });

  describe('normal', function () {
    it('valid', function () {
      expectErrorLength(customSchema, {
        password: 'password',
        confirmPassword: 'password',
      }).to.equal(0);
    });

    it('invalid', function () {
      expectErrorOfTypeLength('passwordMismatch', customSchema, {
        password: 'password',
        confirmPassword: 'password1',
      }).to.equal(1);
    });
  });
});

// describe('custom', function () {
//   it('custom validation runs even when the optional field is undefined', function () {
//     const customSchema = new FasterSchema({
//       foo: {
//         type: String,
//         optional: true,
//         custom: () => 'custom',
//       },
//     });

//     const context = customSchema.namedContext();
//     context.validate({});
//     expect(context.validationErrors().length).to.equal(1);
//     expect(context.validationErrors()[0]).to.eql({ name: 'foo', label: 'Foo', type: 'custom', value: undefined });
//   });
// });
