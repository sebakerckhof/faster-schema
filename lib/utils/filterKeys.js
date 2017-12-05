import ancestorKeysOf from './ancestorKeysOf';

const xor = (a, b) => (a || b) && !(a && b);

export default function filterKeys(keys, filter, match = true) {
  const expandedKeys = new Set(filter);

  if (match) {
    filter
    .map(k => ancestorKeysOf(k))
    .reduce((acc, el) => [...acc, ...el], [])
    .forEach(k => expandedKeys.add(k));
  }

  const wildcards = filter.filter(k => k.endsWith('.*'))
    .map(k => k.slice(0, -1));

  wildcards.forEach(wc => expandedKeys.add(wc.slice(0, -1)));

  return keys.filter(key => xor(!match, (
    expandedKeys.has(key)
    || !!wildcards.find(w => key.startsWith(w))
  )));
}
