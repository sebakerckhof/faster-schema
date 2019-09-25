export default function sortKeys(keys) {
  keys = keys.map((k) => k.split('.'));
  keys.sort((a, b) => a.length - b.length);
  keys = keys.map((k) => k.join('.'));
  return keys;
}
