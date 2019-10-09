import getAutoValueFunction from './getAutoValueFunction';

const hasOwn = Object.prototype.hasOwnProperty;

export default function defaultValueToAutoValue(definition) {
  const hasDefaultValue = hasOwn.call(definition, 'defaultValue');
  const hasAutoValueFunction = hasOwn.call(definition, 'autoValue') && typeof definition.autoValue === 'function';

  if (hasDefaultValue && !hasAutoValueFunction) {
    definition.autoValue = getAutoValueFunction(definition.defaultValue);
  }
  return definition;
}
