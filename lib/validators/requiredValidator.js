import FasterSchema from '../FasterSchema';

export default function requiredValidator({ def, value }) {
  if (def.optional) return;

  // If value is null, no matter what, we add required
  if (value === null || value === undefined) return FasterSchema.ErrorTypes.REQUIRED;
}
