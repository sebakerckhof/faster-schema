import FasterSchema from '../FasterSchema';

const optionalCustomSchema = new FasterSchema({
  foo: {
    type: String,
    optional: true,
    custom: () => 'custom',
  },
});

export default optionalCustomSchema;
