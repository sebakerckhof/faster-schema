import parentKeyOf from './parentKeyOf';

export default function ancestorKeysOf(key) {
  const ancestors = [];
  while (key.includes('.')) {
    key = parentKeyOf(key);
    ancestors.unshift(key);
  }
  return ancestors;
}
