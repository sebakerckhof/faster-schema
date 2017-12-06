import { ErrorTypes } from './FasterSchema';
import isObject from './utils/isObject';
import builtInValidators from './validators';

const hasOwn = Object.prototype.hasOwnProperty;

function validateField(validator, context) {
  const result = validator(context);
  // If the validator returns a string, assume it is the
  // error type.
  if (typeof result === 'string') {
    context.fieldValidationErrors.push({
      name: context.path,
      label: context.def.label,
      type: result,
      value: context.value,
    });
    return false;
  }

  // If the validator returns an object, assume it is an
  // error object.
  if (typeof result === 'object' && result !== null) {
    context.fieldValidationErrors.push({
      name: context.path,
      label: context.def.label,
      value: context.value,
      ...result,
    });
    return false;
  }

  // If the validator returns false, assume they already added the validation errors
  if (result === false) return false;

  // Any other return value we assume means it was valid
  return true;
}

function validatePathInObject({
  value,
  schema,
  path = '',
  genericPath = '',
  keysToValidate,
  parentObj = value,
  rootObj = parentObj,
  validators = [],
}) {
  let validationErrors = [];

  // Skip this field if it does not need to be validated
  const shouldValidateKey = !keysToValidate
    || (!path && keysToValidate.length > 0)
    || keysToValidate.some(keyToValidate => (
      keyToValidate === path ||
      keyToValidate === genericPath ||
      keyToValidate.startsWith(`${path}.`) ||
      keyToValidate.startsWith(`${genericPath}.`)
    ));

  if (!shouldValidateKey) {
    return [];
  }

  let definition;
  if (genericPath) {
    if (!hasOwn.call(schema.definitions, genericPath)) {
      validationErrors = [{ name: path, type: ErrorTypes.KEY_NOT_IN_SCHEMA }].concat(validationErrors);
      return validationErrors;
    }

    definition = schema.definitions[genericPath];
  } else {
    definition = { type: 'object' };
  }

  // run validators against definition
  const fieldValidators = validators.slice(0);
  if (typeof definition.custom === 'function') {
    fieldValidators.splice(builtInValidators.length, 0, definition.custom);
  }

  const fieldValidationErrors = [];
  const context = {
    def: definition,
    value,
    parentObj,
    rootObj,
    path,
    genericPath,
    fieldValidators,
    fieldValidationErrors,
  };

  const fieldIsValid = fieldValidators.every(validator => validateField(validator, context));

  if (!fieldIsValid) {
    validationErrors = validationErrors.concat(fieldValidationErrors);
  } else if (definition.type === 'object' && !definition.blackbox && value !== null) {
    const obj = value;
    const pathWithDot = path ? `${path}.` : '';
    const genericPathWithDot = genericPath ? `${genericPath}.` : '';
    const requiredFields = {};
    schema.hierarchy[genericPath || '$ROOT'].requiredFields.forEach((f) => {
      requiredFields[f] = true;
    });

    // schema.hierarchy[genericPath || '$ROOT'].customFields.forEach(f => {
    //   obj[f] = obj[f];
    // });
    const keys = Object.keys(obj);

    for (const key of keys) {
      const affectedKey = `${pathWithDot}${key}`;
      const affectedKeyGeneric = `${genericPathWithDot}${key}`;
      const affectedValue = obj[key];
      validationErrors = validationErrors.concat(validatePathInObject({
        value: affectedValue,
        schema,
        path: affectedKey,
        genericPath: affectedKeyGeneric,
        parentObj: obj,
        rootObj,
        validators,
      }));
      delete requiredFields[key];
    }

    const missingFields = Object.keys(requiredFields);
    validationErrors = validationErrors.concat(missingFields.map(field => ({
      name: `${pathWithDot}${field}`,
      label: schema.definitions[`${genericPathWithDot}${field}`].label,
      type: ErrorTypes.REQUIRED,
    })));
  } else if (definition.type === 'array') {
    const genericChildPath = `${genericPath}.$`;
    for (let i = 0; i < value.length; i += 1) {
      const childPath = `${path}.${i}`;
      validationErrors = validationErrors.concat(validatePathInObject({
        value: value[i],
        path: childPath,
        schema,
        genericPath: genericChildPath,
        parentObj: value,
        rootObj,
        validators,
      }));
    }
  }

  return validationErrors;
}

export default function doValidation({
  obj,
  schema,
  ignoreTypes = [],
  keysToValidate,
  docValidators,
  validators,
}) {
  // First do some basic checks of the object, and throw errors if necessary
  if (!isObject(obj)) {
    throw new Error('The first argument of validate() must be an object');
  }

  let validationErrors = validatePathInObject({
    value: obj,
    schema,
    parentObj: obj,
    keysToValidate,
    validators,
  });

  // Custom whole-doc validators
  docValidators.forEach((func) => {
    const errors = func(obj);
    if (!Array.isArray(errors)) throw new Error('Custom doc validator must return an array of error objects');
    if (errors.length) validationErrors = validationErrors.concat(errors);
  });

  const addedFieldNames = new Set();
  validationErrors = validationErrors.filter((errObj) => {
    // Remove error types the user doesn't care about
    if (ignoreTypes.includes(errObj.type)) return false;
    // Make sure there is only one error per fieldName
    if (addedFieldNames.has(errObj.name)) return false;

    addedFieldNames.add(errObj.name);
    return true;
  });

  return validationErrors;
}
