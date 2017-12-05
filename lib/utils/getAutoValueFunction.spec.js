import { expect } from 'chai';
import getAutoValueFunction from './getAutoValueFunction';

describe('getAutoValueFunction', function () {
  it('should generate a auto value function from a default value', function () {
    const fn = getAutoValueFunction('foo');
    expect(fn({ isSet: false })).to.equal('foo');
    expect(fn({ isSet: true, value: 'bar' })).to.equal('bar');
  });
});
