import { cloneDeep } from 'lodash';
import kindOf from 'kind-of';
import converToProperType from './utils/convertToProperType';
import parentKeyOf from './utils/parentKeyOf';
import makeKeyGeneric from './utils/makeKeyGeneric';
import getValueFromObj from './utils/getValue';
import isObject from './utils/isObject';
import checkObject from './validators/checkObject';

const defaultOptions = {
  filter: true,
  trimStrings: true,
  removeEmptyStrings: true,
  autoConvert: true,
  getAutoValues: true,
  mutate: true,
};

function cleanAllowedValue(value, allowedValues) {
  return allowedValues.includes(value) ? value : undefined;
}

function cleanValue({
  path, genericPath, value, definition, parentObj, rootObj, schema, options, cleaningPath = [],
}) {
  if (
    (definition.type !== 'object' && isObject(value))
    || (definition.type === 'object' && !!checkObject({ def: definition, value }))
  ) {
    value = undefined;
  }

  if (options.autoConvert) {
    value = converToProperType(value, definition.type);
  }

  const { allowedValues } = definition;

  if (allowedValues) {
    value = cleanAllowedValue(value, allowedValues);
  }

  if (definition.type === 'string' && kindOf(value) === 'string') {
    if (options.trimStrings && definition.trim !== false) {
      value = value.trim();
    }

    if (!value.length && options.removeEmptyStrings) {
      value = undefined;
    }
  }

  if (options.getAutoValues && typeof definition.autoValue === 'function') {
    const getValue = (key) => {
      cleaningPath = [...cleaningPath, path];
      const parentKey = parentKeyOf(key);
      const parentObjForKey = getValueFromObj(rootObj, parentKey);
      return cleanRecursive({
        path: key,
        value: getValueFromObj(rootObj, key),
        schema,
        parentObj: parentObjForKey,
        rootObj,
        options,
        cleaningPath,
      });
    };

    value = definition.autoValue({
      value,
      path,
      genericPath,
      isSet: value !== undefined,
      parentObj,
      rootObj,
      getValue,
      getSiblingValue(sibling) {
        let parentKey = parentKeyOf(path);
        parentKey = parentKey ? `${parentKey}.` : '';
        return getValue(`${parentKey}${sibling}`);
      },
    });
  }

  return value;
}

function cleanRecursive({
  path = '',
  genericPath = makeKeyGeneric(path),
  value,
  schema,
  parentObj = value,
  rootObj = parentObj,
  options,
  cleaningPath = [],
}) {
  if (cleaningPath.includes(path)) {
    throw new Error(`Circular dependency in autoValue functions: ${cleaningPath.join(' -> ')}`);
  }

  const pathWithDot = path ? `${path}.` : '';
  const genericPathWithDot = genericPath ? `${genericPath}.` : '';
  const definition = genericPath ? schema.definitions[genericPath] : { type: 'object' };

  if (!definition) {
    return undefined;
  }

  const cleanedValue = path ? cleanValue({
    path,
    genericPath,
    definition,
    value,
    schema,
    parentObj,
    rootObj,
    options,
    cleaningPath,
  }) : value;

  if (isObject(cleanedValue) && !definition.blackbox) {
    const object = cleanedValue;
    const hierarchyInfo = schema.hierarchy[genericPath || '$ROOT'];

    if (options.filter) {
      hierarchyInfo.autoValueFields.forEach((field) => {
        object[field] = object[field]; // eslint-disable-line
      });
    }
    const keys = Object.keys(object);

    for (const key of keys) {
      const cleanedSubKey = cleanRecursive({
        path: `${pathWithDot}${key}`,
        genericPath: `${genericPathWithDot}${key}`,
        value: object[key],
        schema,
        parentObj: object,
        rootObj,
        options,
        cleaningPath,
      });

      if (cleanedSubKey === undefined) {
        delete object[key];
        continue;
      }

      object[key] = cleanedSubKey;
    }
    return object;
  } if (Array.isArray(cleanedValue)) {
    const cleanedArray = [];
    const genericChildPath = `${genericPathWithDot}$`;
    cleanedValue.forEach((el, i) => {
      const cleanedChild = cleanRecursive({
        path: `${pathWithDot}${i}`,
        genericPath: genericChildPath,
        value: el,
        schema,
        parentObj: cleanedValue,
        rootObj,
        options,
        cleaningPath,
      });
      if (cleanedChild !== undefined
        && (!options.removeNullsFromArrays || cleanedChild !== null)) {
        cleanedArray.push(cleanedChild);
      }
    });
    return cleanedArray;
  }

  return cleanedValue;
}

export default function clean(schema, obj, options = {}) {
  options = {
    ...defaultOptions,
    ...options,
  };

  if (!options.mutate) {
    obj = cloneDeep(obj);
  }

  // First do some basic checks of the object, and throw errors if necessary
  if (!isObject(obj)) {
    throw new Error('The first argument of validate() must be an object');
  }

  return cleanRecursive({
    value: obj,
    schema: schema._compiled,
    options,
  });
}
