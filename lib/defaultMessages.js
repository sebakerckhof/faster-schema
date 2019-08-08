import regExpObj from './regExp';

const regExpMessages = [
  { exp: regExpObj.Email, msg: 'must be a valid email address' },
  { exp: regExpObj.EmailWithTLD, msg: 'must be a valid email address' },
  { exp: regExpObj.Domain, msg: 'must be a valid domain' },
  { exp: regExpObj.WeakDomain, msg: 'must be a valid domain' },
  { exp: regExpObj.IP, msg: 'must be a valid IPv4 or IPv6 address' },
  { exp: regExpObj.IPv4, msg: 'must be a valid IPv4 address' },
  { exp: regExpObj.IPv6, msg: 'must be a valid IPv6 address' },
  { exp: regExpObj.Url, msg: 'must be a valid URL' },
  { exp: regExpObj.Id, msg: 'must be a valid alphanumeric ID' },
  { exp: regExpObj.ZipCode, msg: 'must be a valid ZIP code' },
  { exp: regExpObj.Phone, msg: 'must be a valid phone number' },
];

const defaultMessages = {
  initialLanguage: 'en',
  messages: {
    en: {
      required({ label }) { return `${label} is required`; },
      minString({ label, min }) { return `${label} must be at least ${min} characters`; },
      maxString({ label, max }) { return `${label} cannot exceed ${max} characters`; },
      minNumber({ label, min }) { return `${label} must be at least ${min}`; },
      maxNumber({ label, max }) { return `${label} cannot exceed ${max}`; },
      minNumberExclusive({ label, min }) { return `${label} must be greater than ${min}`; },
      maxNumberExclusive({ label, max }) { return `${label} must be less than ${max}`; },
      minDate({ label, min }) { return `${label} must be on or after ${min}`; },
      maxDate({ label, max }) { return `${label} cannot be after ${max}`; },
      badDate({ label }) { return `${label} is not a valid date`; },
      minCount({ minCount }) { return `You must specify at least ${minCount} values`; },
      maxCount({ maxCount }) { return `You cannot specify more than ${maxCount} values`; },
      noDecimal({ label }) { return `${label} must be an integer`; },
      notAllowed({ label, value }) { return `${value} is not an allowed value for ${label}`; },
      expectedType({ label, dataType }) { return `${label} must be of type ${dataType}`; },
      regEx({
        label,
        regExp,
      }) {
        // See if there's one where exp matches this expression
        let msgObj;
        if (regExp) {
          msgObj = regExpMessages.find(o => o.exp && o.exp.toString() === regExp);
        }

        const regExpMessage = msgObj ? msgObj.msg : 'failed regular expression validation';

        return `${label} ${regExpMessage}`;
      },
      keyNotInSchema({ name }) { return `${name} is not allowed by the schema`; },
    },
  },
};

export default defaultMessages;
