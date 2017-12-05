export default function parentKeyOf(key) {
  return key.substr(0, key.lastIndexOf('.'));
}
