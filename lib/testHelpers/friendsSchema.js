import FasterSchema from '../FasterSchema';

const friendsSchema = new FasterSchema({
  name: {
    type: String,
    optional: true,
  },
  friends: {
    type: Array,
    minCount: 1,
  },
  'friends.$': {
    type: Object,
  },
  'friends.$.name': {
    type: String,
    max: 3,
  },
  'friends.$.type': {
    type: String,
    allowedValues: ['best', 'good', 'bad'],
  },
  'friends.$.a': {
    type: Object,
    optional: true,
  },
  'friends.$.a.b': {
    type: Number,
    optional: true,
  },
  enemies: {
    type: Array,
  },
  'enemies.$': {
    type: Object,
  },
  'enemies.$.name': {
    type: String,
  },
  'enemies.$.traits': {
    type: Array,
    optional: true,
  },
  'enemies.$.traits.$': {
    type: Object,
  },
  'enemies.$.traits.$.name': {
    type: String,
  },
  'enemies.$.traits.$.weight': {
    type: Number,
  },
});

export default friendsSchema;
