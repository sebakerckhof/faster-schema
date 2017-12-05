import { expect } from 'chai';
import convertFromSimpleSchema from './convertFromSimpleSchema';

class Constructable {}
const nonConstructable = () => {};

describe('convertSimpleSchemaType', function () {
  it('should convert to string type', function () {
    expect(convertFromSimpleSchema({ type: String })).to.eql({ type: 'string' });
    expect(convertFromSimpleSchema({ type: Array })).to.eql({ type: 'array' });
    expect(convertFromSimpleSchema({ type: Object })).to.eql({ type: 'object' });
  });

  it('should throw when passing a non-constructable custom object', function () {
    expect(() => convertFromSimpleSchema({ type: nonConstructable })).to.throw('Type is not a constructor');
  });

  it('should not convert constructors of custom objects', function () {
    expect(convertFromSimpleSchema({ type: Constructable })).to.eql({ type: 'object', instanceOf: Constructable });
  });
});
