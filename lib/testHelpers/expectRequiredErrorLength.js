import { expect } from 'chai';
import validate from './validate';
import FasterSchema from '../FasterSchema';

export default function expectRequiredErrorLength(...args) {
  const errors = validate(...args).validationErrors();

  let requiredErrorCount = 0;
  errors.forEach(error => {
    if (error.type === FasterSchema.ErrorTypes.REQUIRED) requiredErrorCount++;
  });
  return expect(requiredErrorCount);
}
