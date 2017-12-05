import { expect } from 'chai';
import defaultValueForAutoValue from './defaultValueToAutoValue';

describe('defaultValueForAutoValue', function () {
  it('Should convert default values', function () {
    const definition = {
      defaultValue: 'foo',
    };
    defaultValueForAutoValue(definition);
    expect(definition.autoValue({ isSet: false })).to.equal('foo');
  });
});
