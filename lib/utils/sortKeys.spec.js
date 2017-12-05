import { expect } from 'chai';
import sortKeys from './sortKeys';

describe('sortKeys', function () {
  it('returns the keys sorted according to depth', function () {
    expect(sortKeys(['foo.bar', 'foo', 'foo.bar.baz'])).to.eql(['foo', 'foo.bar', 'foo.bar.baz']);
  });
});
