export default function convertFromSimpleSchema(definition) {
  switch (definition.type) {
    case Object: {
      definition.type = 'object';
      break;
    }
    case Date: {
      definition.type = 'date';
      break;
    }
    case Array: {
      definition.type = 'array';
      break;
    }
    case Number: {
      definition.type = 'number';
      break;
    }
    case String: {
      definition.type = 'string';
      break;
    }
    case Boolean: {
      definition.type = 'boolean';
      break;
    }
    default: {
      definition.instanceOf = definition.type;
      definition.name = definition.type.prototype.constructor.name;
      definition.type = 'object';
    }
  }
  return definition;
}
