import { expect } from 'chai';
import getValue from './getValue';

const obj = {
  foo: 'v',
  bar: [
    {
      key: 'value',
    },
  ],
};

describe('getValue', function () {
  it('should get value from object', function () {
    expect(getValue(obj, 'foo')).to.equal('v');
    expect(getValue(obj, 'bar.0.key')).to.equal('value');
  });
});
