export default function getDefaultAutoValueFunction(defaultValue) {
  return function defaultAutoValueFunction({ isSet, value }) {
    if (!isSet) {
      return defaultValue;
    }
    return value;
  };
}
