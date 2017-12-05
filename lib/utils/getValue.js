export default function getValue(object, path) {
  try {
    return path.split('.').reduce((subObj, field) => subObj[field], object);
  } catch (error) {
    return undefined;
  }
}
