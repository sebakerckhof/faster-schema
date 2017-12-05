import FasterSchema from './FasterSchema';
import doValidation from './doValidation';
import makeKeyGeneric from './utils/makeKeyGeneric';
import builtInValidators from './validators';

const builtInDocValidators = [];

export default class ValidationContext {
  constructor(schema) {
    this._schema = schema;
    this.reset();
  }

  _getDocumentValidators() {
    return builtInDocValidators
      .concat(this._schema._docValidators)
      .concat(FasterSchema._docValidators);
  }

  _getValidators() {
    return builtInValidators
    .concat(this._schema._validators)
    .concat(FasterSchema._validators);
  }

  setValidationErrors(errors) {
    this._validationErrors = errors;
  }

  addValidationErrors(errors) {
    for (const error of errors) {
      this._validationErrors.push(error);
    }
  }

  // Reset the validationErrors array
  reset() {
    this._hasRun = false;
    this._validationErrors = [];
  }

  getErrorForKey(key, genericKey = makeKeyGeneric(key)) {
    return this._validationErrors.find(e => e.name === key)
      || this._validationErrors.find(e => e.name === genericKey);
  }

  keyIsInvalid(key, genericKey) {
    return !!this.getErrorForKey(key, genericKey);
  }

  keyErrorMessage(key, genericKey) {
    const errorObj = this.getErrorForKey(key, genericKey);
    if (!errorObj) return '';

    return this._schema.messageForError(errorObj);
  }

  isValid() {
    if (!this._hasRun) {
      this.validate();
    }
    return this._validationErrors.length === 0;
  }

  validationErrors() {
    return this._validationErrors;
  }

  /**
   * Validates the object against the schema and sets a reactive array of error objects
   */
  validate(obj, {
    ignore: ignoreTypes = [],
    keys: keysToValidate,
  } = {}) {
    const validationErrors = doValidation({
      obj,
      schema: this._schema._compiled,
      ignoreTypes,
      keysToValidate,
      validators: this._getValidators(),
      docValidators: this._getDocumentValidators(),
    });

    if (keysToValidate) {
      // We have only revalidated the listed keys, so if there
      // are any other existing errors that are NOT in the keys list,
      // we should keep these errors.
      for (const error of this._validationErrors) {
        const wasValidated = keysToValidate.some(key => key === error.name || error.name.startsWith(`${key}.`));
        if (!wasValidated) validationErrors.push(error);
      }
    }

    this.setValidationErrors(validationErrors);
    this._hasRun = true;

    // Return true if it was valid; otherwise, return false
    return this.isValid();
  }

  clean(...args) {
    return this._schema.clean(...args);
  }
}
