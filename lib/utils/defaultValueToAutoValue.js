import getAutoValueFunction from './getAutoValueFunction';

const hasOwn = Object.prototype.hasOwnProperty;

export default function defaultValueToAutoValue(definition) {
  if (hasOwn.call(definition, 'defaultValue') && !hasOwn.call(definition, 'autoValue')) {
    definition.autoValue = getAutoValueFunction(definition.defaultValue);
  }
  return definition;
}
