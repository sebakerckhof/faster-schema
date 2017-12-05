import FasterSchema from '../FasterSchema';

const requiredSchema = new FasterSchema({
  requiredString: {
    type: String,
  },
  requiredBoolean: {
    type: Boolean,
  },
  requiredNumber: {
    type: Number,
  },
  requiredDate: {
    type: Date,
  },
  requiredEmail: {
    type: String,
    regEx: FasterSchema.RegEx.Email,
  },
  requiredUrl: {
    type: String,
    regEx: FasterSchema.RegEx.Url,
  },
  requiredObject: {
    type: Object,
  },
  'requiredObject.requiredNumber': {
    type: Number,
  },
  optionalObject: {
    type: Object,
    optional: true,
  },
  'optionalObject.requiredString': {
    type: String,
  },
  anOptionalOne: {
    type: String,
    optional: true,
    min: 20,
  },
});

export default requiredSchema;
