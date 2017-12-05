import typeValidator from './typeValidator';
import allowedValuesValidator from './allowedValuesValidator';
import requiredValidator from './requiredValidator';

const builtInValidators = [
  requiredValidator,
  typeValidator,
  allowedValuesValidator,
];

export default builtInValidators;
