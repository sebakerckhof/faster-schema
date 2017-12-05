import kindOf from 'kind-of';

export default function convertFromSimpleSchema(definition) {
  if (definition.type === undefined) {
    return;
  }

  const Type = definition.type;
  let instanceType;
  try {
    const instance = new Type();
    instanceType = kindOf(instance);
  } catch (err) {
    if (err.message === 'Type is not a constructor') {
      throw err;
    } else {
      instanceType = 'object';
    }
  }

  definition.type = instanceType;
  if (instanceType === 'object' && Type !== Object) {
    definition.instanceOf = Type;
  }

  return definition;
}
