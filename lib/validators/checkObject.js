import { ErrorTypes } from '../FasterSchema';

function checkObject({ def, value }) {
  if (def.instanceOf && !(value instanceof def.instanceOf)) {
    return { type: ErrorTypes.EXPECTED_TYPE, dataType: def.type.name };
  }
  if (value === Object(value) && !(value instanceof Date)) {
    return;
  }
  return { type: ErrorTypes.EXPECTED_TYPE, dataType: 'Object' };
}

export default checkObject;
