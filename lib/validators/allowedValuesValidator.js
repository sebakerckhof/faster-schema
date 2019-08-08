import { ErrorTypes } from '../FasterSchema';

function allowedValuesValidator({ def, value }) {
  const { allowedValues } = def;
  if (!allowedValues) return;

  const isAllowed = allowedValues.includes(value);
  return isAllowed ? true : { type: ErrorTypes.VALUE_NOT_ALLOWED, value };
}

export default allowedValuesValidator;
