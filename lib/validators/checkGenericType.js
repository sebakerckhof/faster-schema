import kindOf from 'kind-of';
import { ErrorTypes } from '../FasterSchema';

function checkGenericType({ def, value }) {
  if (kindOf(value) === def.type) return;
  return { type: ErrorTypes.EXPECTED_TYPE, dataType: def.type };
}

export default checkGenericType;
