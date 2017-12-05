import { ErrorTypes } from '../FasterSchema';

function checkArray({ def, value }) {
  // Is it an array?
  if (!Array.isArray(value)) {
    return { type: ErrorTypes.EXPECTED_TYPE, dataType: 'Array' };
  }

  // Are there fewer than the minimum number of items in the array?
  if (def.minCount !== null && value.length < def.minCount) {
    return { type: ErrorTypes.MIN_COUNT, minCount: def.minCount };
  }

  // Are there more than the maximum number of items in the array?
  if (def.maxCount !== null && value.length > def.maxCount) {
    return { type: ErrorTypes.MAX_COUNT, maxCount: def.maxCount };
  }
}

export default checkArray;
