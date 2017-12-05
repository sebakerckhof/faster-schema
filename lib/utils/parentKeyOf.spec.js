import { expect } from 'chai';
import parentKeyOf from './parentKeyOf';

describe('parentKeyOf', function () {
  it('returns the correct parent key', function () {
    expect(parentKeyOf('a.b.c')).to.equal('a.b');
    expect(parentKeyOf('a')).to.equal('');
  });
});
