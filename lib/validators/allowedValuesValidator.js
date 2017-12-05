import { ErrorTypes } from '../FasterSchema';

function allowedValuesValidator({ def, value }) {
  const allowedValues = def.allowedValues;
  if (!allowedValues) return;

  const isAllowed = allowedValues.includes(value);
  return isAllowed ? true : ErrorTypes.VALUE_NOT_ALLOWED;
}

export default allowedValuesValidator;
