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

  it('should set autoValue function when it has been reset', function () {
    const definition = {
      defaultValue: 'foo',
      autoValue: null,
    };
    defaultValueForAutoValue(definition);
    expect(definition.autoValue({ isSet: false })).to.equal('foo');
  });
});
