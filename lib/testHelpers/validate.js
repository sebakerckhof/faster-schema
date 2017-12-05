export default function validate(fs, doc, options) {
  const context = fs.newContext();
  context.validate(doc, options);
  return context;
}
