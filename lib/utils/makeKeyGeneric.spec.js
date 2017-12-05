import { expect } from 'chai';
import makeKeyGeneric from './makeKeyGeneric';

describe('makeKeyGeneric', function () {
  it('should make a key generic', function () {
    expect(makeKeyGeneric('a.b.$.foo.0.bar.2.3.baz.100.99')).to.equal('a.b.$.foo.$.bar.$.$.baz.$.$');
  });
});
