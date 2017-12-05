import FasterSchema from '../FasterSchema';
import Address from './Address';

const testSchema = new FasterSchema({
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
    decimal: true,
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
});

export default testSchema;
