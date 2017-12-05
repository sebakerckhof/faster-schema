import { expect } from 'chai';
import ancestorKeysOf from './ancestorKeysOf';

describe('ancestorKeysOf', function () {
  it('returns ancestor array', function () {
    expect(ancestorKeysOf('foo.bar.baz')).to.eql(['foo', 'foo.bar']);
  });
});
