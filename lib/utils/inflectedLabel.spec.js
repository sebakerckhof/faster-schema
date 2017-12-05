import { expect } from 'chai';
import inflectedLabel from './inflectedLabel';

describe('inflectedLabel', function () {
  it('returns the correct string for a non-array key', function () {
    expect(inflectedLabel('foo.bar.baz')).to.equal('baz');
  });

  it('returns the correct string for an array key', function () {
    expect(inflectedLabel('foo.bar.$.$')).to.equal('bar');
  });
});
