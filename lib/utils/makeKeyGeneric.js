/* Takes a specific string that uses mongo-style dot notation
* and returns a generic string equivalent. Replaces all numeric
* "pieces" with a dollar sign ($).
*
* @param {type} name
* @returns {String} Generic name.
*/
export default function makeKeyGeneric(key) {
  if (typeof key !== 'string') return null;
  return key.replace(/\.[0-9]+(?=\.|$)/g, '.$');
}
