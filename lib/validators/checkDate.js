import { ErrorTypes } from '../FasterSchema';

function dateToDateString(date) {
  let m = (date.getUTCMonth() + 1);
  if (m < 10) m = `0${m}`;
  let d = date.getUTCDate();
  if (d < 10) d = `0${d}`;
  return `${date.getUTCFullYear()}-${m}-${d}`;
}

function checkDate({ def, value }) {
  if (!(value instanceof Date)) return { type: ErrorTypes.EXPECTED_TYPE, dataType: 'Date' };

  // Is it an invalid date?
  if (isNaN(value.getTime())) return { type: ErrorTypes.BAD_DATE };

  // Is it earlier than the minimum date?
  if (def.min && typeof def.min.getTime === 'function' && def.min.getTime() > value.getTime()) {
    return { type: ErrorTypes.MIN_DATE, min: dateToDateString(def.min) };
  }

  // Is it later than the maximum date?
  if (def.max && typeof def.max.getTime === 'function' && def.max.getTime() < value.getTime()) {
    return { type: ErrorTypes.MAX_DATE, max: dateToDateString(def.max) };
  }
}

export default checkDate;
