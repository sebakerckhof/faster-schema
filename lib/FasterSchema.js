import { cloneDeep, merge as mergeObjects } from 'lodash';
import kindOf from 'kind-of';
import ValidationContext from './ValidationContext';
import defaultMessages from './defaultMessages';
import clean from './clean';
import RegEx from './regExp';
import {
  inflectedLabel,
  defaultValueToAutoValue,
  convertFromSimpleSchema,
  parentKeyOf,
  filterKeys,
  sortKeys,
  makeKeyGeneric,
} from './utils';
import checkArray from './validators/checkArray';
import checkDate from './validators/checkDate';
import checkNumber from './validators/checkNumber';
import checkString from './validators/checkString';
import checkObject from './validators/checkObject';
import checkGenericType from './validators/checkGenericType';

const hasOwn = Object.prototype.hasOwnProperty;
const defaultOptions = { requiredByDefault: true, humanizeAutoLabels: true };

function cloneDefinitions(definitions) {
  const clone = {};
  Object.keys(definitions).forEach((d) => {
    clone[d] = { ...definitions[d] };
  });
  return clone;
}
class FasterSchema {
  constructor(schema, options = {}) {
    this._options = { ...defaultOptions, ...options };
    this._docValidators = [];
    this._validators = [];
    this._validationContexts = {};
    this._compile(schema);
  }
  static Integer = 'integer';
  static _docValidators = [];
  static _validators = [];
  static _typeValidators = {
    arguments: checkGenericType,
    array: checkArray,
    boolean: checkGenericType,
    buffer: checkGenericType,
    date: checkDate,
    error: checkGenericType,
    float32array: checkGenericType,
    float64array: checkGenericType,
    function: checkGenericType,
    generatorfunction: checkGenericType,
    int16array: checkGenericType,
    int32array: checkGenericType,
    int8array: checkGenericType,
    map: checkGenericType,
    null: checkGenericType,
    integer: checkNumber,
    number: checkNumber,
    object: checkObject,
    regexp: checkString,
    set: checkGenericType,
    string: checkString,
    symbol: checkGenericType,
    uint16array: checkGenericType,
    uint32array: checkGenericType,
    uint8array: checkGenericType,
    uint8clampedarray: checkGenericType,
    weakmap: checkGenericType,
    weakset: checkGenericType,
  };
  static defaultMessages = defaultMessages;
  static validationErrorTransform = error => error;
  static ErrorTypes = {
    REQUIRED: 'required',
    MIN_STRING: 'minString',
    MAX_STRING: 'maxString',
    MIN_NUMBER: 'minNumber',
    MAX_NUMBER: 'maxNumber',
    MIN_NUMBER_EXCLUSIVE: 'minNumberExclusive',
    MAX_NUMBER_EXCLUSIVE: 'maxNumberExclusive',
    MIN_DATE: 'minDate',
    MAX_DATE: 'maxDate',
    BAD_DATE: 'badDate',
    MIN_COUNT: 'minCount',
    MAX_COUNT: 'maxCount',
    MUST_BE_INTEGER: 'noDecimal',
    VALUE_NOT_ALLOWED: 'notAllowed',
    EXPECTED_TYPE: 'expectedType',
    FAILED_REGULAR_EXPRESSION: 'regEx',
    KEY_NOT_IN_SCHEMA: 'keyNotInSchema',
  };
  static RegEx = RegEx;

  static addType(type, validator) {
    FasterSchema._typeValidators[type] = validator;
  }

  static defineValidationErrorTransform(transformFn) {
    FasterSchema.validationErrorTransform = transformFn;
  }

  static addDocValidator(fn) {
    FasterSchema._docValidators.push(fn);
  }

  static addValidator(fn) {
    FasterSchema._validators.push(fn);
  }

  static validate(obj, schema, options) {
    if (!(schema instanceof FasterSchema)) {
      schema = new FasterSchema(schema);
    }
    return schema.validate(obj, options);
  }

  static setDefaultMessages(messages) {
    mergeObjects(FasterSchema.defaultMessages, messages);
  }

  static merge(...schemas) {
    schemas = schemas.filter(s => !!s);
    if (!schemas.length) {
      schemas.push({});
    }
    let initial = schemas.shift();
    if (!(initial instanceof FasterSchema)) {
      initial = new FasterSchema(initial);
    } else {
      initial = initial.clone();
    }
    return schemas.reduce((completeSchema, partial) => completeSchema.extend(partial), initial);
  }

  static hierarchyStruct() {
    return { autoValueFields: new Set(), customFields: new Set(), requiredFields: new Set() };
  }

  addDocValidator(fn) {
    this._docValidators.push(fn);
  }

  addValidator(fn) {
    this._validators.push(fn);
  }

  _compile(object = {}, merge = false) {
    if (!merge || !this._compiled) {
      this._compiled = {
        definitions: {},
        hierarchy: { $ROOT: FasterSchema.hierarchyStruct() },
      };
    }
    sortKeys(Object.keys(object))
      .forEach(name => this._expandDefinition(name, object[name], merge));
  }

  get(key, prop) {
    if (this.has(key)) {
      return this._compiled.definitions[key][prop];
    }
  }

  fields() {
    return Object.keys(this._compiled.definitions);
  }

  label(key) {
    return this.get(key, 'label');
  }

  defaultValue(key) {
    return this.get(key, 'defaultValue');
  }

  getAllowedValuesForKey(key) {
    return this.get(key, 'allowedValues');
  }

  has(key) {
    return hasOwn.call(this._compiled.definitions, key);
  }

  allowsKey(key) {
    key = makeKeyGeneric(key);
    return this.has(key) || this.keyIsInBlackBox(key);
  }

  blackboxKeys() {
    return Object.keys(this._compiled.definitions)
      .filter(k => this._compiled.definitions[k].blackbox);
  }

  keyIsInBlackBox(key) {
    key = makeKeyGeneric(key);
    do {
      const parentKey = parentKeyOf(key);
      if (this.get(parentKey, 'blackbox')) {
        return !key.endsWith('.$');
      }
      key = parentKey;
    } while (key);
    return false;
  }

  extend(otherSchema) {
    if (otherSchema instanceof FasterSchema) {
      this._docValidators = [...this._docValidators, ...otherSchema._docValidators];
      this._validators = [...this._validators, ...otherSchema._validators];
      otherSchema = cloneDefinitions(otherSchema._compiled.definitions);
    }

    this._compile(otherSchema, true);
    return this;
  }

  clone() {
    const clone = new FasterSchema({}, { ...this._options });
    clone._docValidators = [...this._docValidators];
    clone._validators = [...this._validators];
    clone._compiled = {
      definitions: cloneDefinitions(this._compiled.definitions),
      hierarchy: cloneDeep(this._compiled.hierarchy),
    };

    return clone;
  }

  newContext() {
    return new ValidationContext(this);
  }

  namedContext(name) {
    if (typeof name !== 'string') name = 'default';
    if (!this._validationContexts[name]) {
      this._validationContexts[name] = new ValidationContext(this);
    }
    return this._validationContexts[name];
  }

  clean(...args) {
    return clean(this, ...args);
  }

  validate(obj, options) {
    // For Meteor apps, `check` option can be passed to silence audit-argument-checks
    if (typeof this._options.check === 'function') {
      // Call check but ignore the error
      try { this._options.check(obj); } catch (e) { /* ignore error */ }
    }

    // obj can be an array, in which case we validate each object in it and
    // throw as soon as one has an error
    const objects = Array.isArray(obj) ? obj : [obj];
    objects.forEach((oneObj) => {
      const validationContext = this.newContext();
      const isValid = validationContext.validate(oneObj, options);

      if (isValid) return;

      const errors = validationContext.validationErrors();

      // In order for the message at the top of the stack trace to be useful,
      // we set it to the first validation error message.
      const message = this.messageForError(errors[0]);

      const error = new Error(message);

      error.name = 'ClientError';
      error.errorType = error.name;
      error.error = 'validation-error';

      // Add meaningful error messages for each validation error.
      // Useful for display messages when using 'mdg:validated-method'.
      error.details = errors.map(errorDetail => ({ ...errorDetail, message: this.messageForError(errorDetail) }));

      // The primary use for the validationErrorTransform is to convert the
      // vanilla Error into a Meteor.Error until DDP is able to pass
      // vanilla errors back to the client.
      if (typeof FasterSchema.validationErrorTransform === 'function') {
        throw FasterSchema.validationErrorTransform(error);
      } else {
        throw error;
      }
    });
  }

  validator(options = {}) {
    return (obj) => {
      const optionsClone = { ...options };
      if (options.clean === true) {
        this.clean(obj, optionsClone);
      }
      if (options.returnErrorsPromise) {
        return this.validateAndReturnErrorsPromise(obj, optionsClone);
      }
      return this.validate(obj, optionsClone);
    };
  }

  /**
   * @param obj {Object} Object to validate.
   * @param [options] {Object} Same options object that ValidationContext#validate takes
   *
   * Returns a Promise that resolves with the errors
   */
  validateAndReturnErrorsPromise(obj, options) {
    const validationContext = this.newContext();
    const isValid = validationContext.validate(obj, options);

    if (isValid) return Promise.resolve([]);

    // Add the `message` prop
    const errors = validationContext.validationErrors().map((errorDetail) => {
      return { ...errorDetail, message: this.messageForError(errorDetail) };
    });

    return Promise.resolve(errors);
  }

  // Returns a string message for the given error type and key.
  messageForError(errorInfo) { //eslint-disable-line
    const dm = FasterSchema.defaultMessages;
    const { type, ...context } = errorInfo;
    return dm.messages[dm.initialLanguage][type](context);
  }

  _sanitizeDefinition(name, definition) {
    definition = { ...definition };
    definition.label = definition.label || inflectedLabel(name, this._options.humanizeAutoLabels);

    if (!hasOwn.call(definition, 'type')) {
      throw new Error(`${name} key is missing "type"`);
    }

    definition = this._synchronizeOptionalAndRequired(definition);
    definition = defaultValueToAutoValue(definition);
    return definition;
  }

  _synchronizeOptionalAndRequired(definition) {
    if (this._options.requiredByDefault && !definition.optional) {
      definition.required = true;
    }

    if (!this._options.requiredByDefault && !definition.required) {
      definition.optional = true;
    }

    return definition;
  }

  _expandDefinition(name, definition, merge = false) {
    if (Object.prototype.toString.call(definition) === '[object Object]' && definition.constructor === Object) {
      // full-form
      if (definition.type instanceof FasterSchema) {
        // nested schema, e.g. foo: { type: FooSchema }
        // this basically copies over all children of the schema.
        this._expandDefinition(name, { ...definition, type: 'object' }, merge);
        const subSchema = definition.type._compiled.definitions;
        Object.keys(subSchema).forEach((subKey) => {
          this._addDefinition(`${name}.${subKey}`, subSchema[subKey], { checkParent: false, merge });
        });
      } else if (Array.isArray(definition.type)) {
        // array shorthand inside full-form, e.g. foo: { type: [String] }
        this._expandDefinition(name, { ...definition, type: 'array' }, merge);

        if (definition.type.length) {
          // add array child element
          this._expandDefinition(`${name}.$`, {
            type: definition.type[0],
          }, merge);
        }
      } else {
        if (kindOf(definition.type) === 'string') {
          // support optional shorthand, e.g. type: 'date?'
          if (definition.type.endsWith('?')) {
            definition.type = definition.type.slice(0, -1);
            definition.optional = true;
          }

          if (definition.type === 'integer') {
            definition.type = 'number';
            definition.integer = true;
          }
        } else if (definition.type instanceof RegExp) {
          // support regex shorthand, e.g. type: /foo$/g
          definition.regEx = definition.type;
          definition.type = 'string';
        } else if (definition.type !== undefined) {
          // Support simple-schema format, e.g. type: String
          convertFromSimpleSchema(definition);
        }
        // No further expansion necessary, add it to the compiled schema
        this._addDefinition(name, definition, { merge });
      }
    } else {
      // Shorthand notation
      // e.g. foo: String
      this._expandDefinition(name, {
        type: definition,
      }, merge);
    }
  }

  _addDefinition(name, definition, { checkParent = true, merge = false } = {}) {
    let parent = '$ROOT';
    let key = name;

    const lastDotPosition = name.lastIndexOf('.');
    if (lastDotPosition > -1) {
      key = name.substr(lastDotPosition + 1, name.length);
      parent = parentKeyOf(name);
      if (checkParent) {
        if (!hasOwn.call(this._compiled.definitions, parent)) {
          throw new Error(`${name} is missing it's parent definition`);
        } else if (key === '$') {
          if (this._compiled.definitions[parent].type !== 'array') {
            throw new Error(`The parent definition of ${name} should be of type 'array'`);
          }
        } else if (this._compiled.definitions[parent].type !== 'object') {
          throw new Error(`The parent definition of ${name} should be of type 'object'`);
        }
      }
    }

    const parentFields = this._compiled.hierarchy[parent];
    const oldDefinition = this._compiled.definitions[name];

    if (oldDefinition) {
      if (!this.has(name)) {
        throw new Error(`${key} key is actually the name of a method on Object`);
      }

      definition = this._synchronizeOptionalAndRequired(definition);
      defaultValueToAutoValue(definition);
    } else {
      definition = this._sanitizeDefinition(name, definition);
    }

    if (definition.required) {
      parentFields.requiredFields.add(key);
    }

    if (definition.custom) {
      parentFields.customFields.add(key);
    }

    if (typeof definition.autoValue === 'function') {
      parentFields.autoValueFields.add(key);
    }

    if (oldDefinition) {
      if (merge) {
        if (hasOwn.call(definition, 'type') && oldDefinition.type !== definition.type) {
          throw new Error(`Cannot change definition type of ${name}`);
        }
        if (definition.optional && !oldDefinition.optional) {
          parentFields.requiredFields.delete(key);
        }
        this._compiled.definitions[name] = { ...oldDefinition, ...definition };
      } else {
        throw new Error(`Duplicate definition for: ${name}`);
      }
    } else {
      if (!hasOwn.call(FasterSchema._typeValidators, definition.type)) {
        throw new Error(`Invalid type: ${definition.type} for key: ${name}`);
      }

      this._compiled.definitions[name] = definition;
      if (definition.type === 'object' || definition.type === 'array') {
        this._compiled.hierarchy[name] = FasterSchema.hierarchyStruct();
      }
    }
  }

  pick(...keys) {
    const keysToAdd = filterKeys(Object.keys(this._compiled.definitions), keys, true);
    return this._partialClone(keysToAdd);
  }

  omit(...keys) {
    const keysToAdd = filterKeys(Object.keys(this._compiled.definitions), keys, false);
    return this._partialClone(keysToAdd);
  }

  getObjectSchema(key) {
    const parent = `${key}.`;
    const schema = {};
    const { definitions } = this._compiled;
    Object.keys(definitions.filter(k => k.startsWith(parent)))
      .forEach((k) => { schema[k.substr(parent.length)] = definitions[k]; });
    return new FasterSchema(schema);
  }

  _partialClone(keys) {
    const definitions = {};
    Object.keys(this._compiled.definitions)
      .filter(k => keys.includes(k))
      .forEach((k) => {
        definitions[k] = this._compiled.definitions[k];
      });
    const schema = new FasterSchema(definitions, { ...this._options });
    schema._validators = [...this._validators];
    return schema;
  }
}

export default FasterSchema;

export const { ErrorTypes } = FasterSchema;
