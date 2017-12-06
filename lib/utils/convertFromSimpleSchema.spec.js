import { expect } from 'chai';
import convertFromSimpleSchema from './convertFromSimpleSchema';

class Constructable {}

describe('convertSimpleSchemaType', function () {
  it('should convert to string type', function () {
    expect(convertFromSimpleSchema({ type: String })).to.eql({ type: 'string' });
    expect(convertFromSimpleSchema({ type: Array })).to.eql({ type: 'array' });
    expect(convertFromSimpleSchema({ type: Object })).to.eql({ type: 'object' });
  });

  it('should not convert constructors of custom objects', function () {
    expect(convertFromSimpleSchema({ type: Constructable })).to.eql({ type: 'object', instanceOf: Constructable });
  });
});
