import FasterSchema from '../FasterSchema';

function typeValidator({ def, value }) {
  if (def.optional && value === null) {
    return;
  }

  return FasterSchema._typeValidators[def.type]({ def, value });
}

export default typeValidator;
