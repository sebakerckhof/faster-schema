import { expect } from 'chai';
import validate from './validate';
import { ErrorTypes } from '../FasterSchema';

export default function expectRequiredErrorLength(...args) {
  const errors = validate(...args).validationErrors();

  let requiredErrorCount = 0;
  errors.forEach((error) => {
    if (error.type === ErrorTypes.REQUIRED) {
      requiredErrorCount += 1;
    }
  });
  return expect(requiredErrorCount);
}
