import { ErrorTypes } from '../FasterSchema';

// Polyfill to support IE11
Number.isInteger = Number.isInteger || function isInteger(value) {
  return typeof value === 'number' && Number.isFinite(value) && Math.floor(value) === value;
};

function checkNumber({ def, value }) {
  const expectsInteger = def.integer;

  // Is it a valid number?
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return { type: ErrorTypes.EXPECTED_TYPE, dataType: expectsInteger ? 'Integer' : 'Number' };
  }

  // Assuming we are not incrementing, is the value less than the maximum value?
  if (def.max !== undefined && (def.exclusiveMax ? def.max <= value : def.max < value)) {
    return { type: def.exclusiveMax ? ErrorTypes.MAX_NUMBER_EXCLUSIVE : ErrorTypes.MAX_NUMBER, max: def.max };
  }

  // Assuming we are not incrementing, is the value more than the minimum value?
  if (def.min !== undefined && (def.exclusiveMin ? def.min >= value : def.min > value)) {
    return { type: def.exclusiveMin ? ErrorTypes.MIN_NUMBER_EXCLUSIVE : ErrorTypes.MIN_NUMBER, min: def.min };
  }

  // Is it an integer if we expect an integer?
  if (expectsInteger && !Number.isInteger(value)) {
    return { type: ErrorTypes.MUST_BE_INTEGER };
  }
}

export default checkNumber;
