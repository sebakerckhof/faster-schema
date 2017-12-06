function parentKeyOf(key) {
  return key.substr(0, key.lastIndexOf('.'));
}

function sortKeys(keys) {
  keys = keys.map(k => k.split('.'));
  keys.sort((a,b) => a.length - b.length);
  keys = keys.map(k => k.join('.'));
  return keys;
}

function ancestorKeysOf(key) {
  const ancestors = [];
  while(key.includes('.')) {
    key = parentKeyOf(key);
    ancestors.push(key);
  }
  return ancestors;
}


const compiled = {
  'foo.bar.baz':'',
  'foo': '',
  'foo.bar': '',
  'foo.baz':'',
  'foobar': '',
  'bar.foo.bar': '',
  'hello':'',
  'world': '',
  'test': '',
  'test.$': '',
  'test.$.seba': '',
  'test.$.sylvie': ''
}
function pick(...keys) {
  //const schema = new FasterSchema();
  const expandedKeys = new Set(keys);
  keys
    .map(k => ancestorKeysOf(k))
    .reduce((acc, el) => [...acc, ...el], [])
    .forEach(k => expandedKeys.add(k));

  const wildcards = keys.filter(k => k.endsWith('.*'))
    .map(k => k.substr(0, k.length - 1));
  wildcards.forEach(wc => expandedKeys.add(wc.substr(0, wc.length - 1)))

  return Object.keys(compiled)
  .filter(key => (
    expandedKeys.has(key) 
    || !!wildcards.find(w => key.startsWith(w))
  ));
}

console.log(pick('foo.*','hello','test.$.sylvie'));