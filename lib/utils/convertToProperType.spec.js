import { expect } from 'chai';
import convertToProperType from './convertToProperType';

describe('convertToProperType', function () {
  it('convert string `false` to boolean value false', function () {
    expect(convertToProperType('false', 'boolean')).to.equal(false);
  });

  it('convert string `FALSE` to boolean value false', function () {
    expect(convertToProperType('FALSE', 'boolean')).to.equal(false);
  });

  it('convert string `true` to boolean value true', function () {
    expect(convertToProperType('true', 'boolean')).to.equal(true);
  });

  it('convert string `TRUE` to boolean value true', function () {
    expect(convertToProperType('TRUE', 'boolean')).to.equal(true);
  });

  it('convert number 1 to boolean value true', function () {
    expect(convertToProperType(1, 'boolean')).to.equal(true);
  });

  it('convert number 0 to boolean value false', function () {
    expect(convertToProperType(0, 'boolean')).to.equal(false);
  });

  it('don\'t convert NaN to boolean value', function () {
    expect(convertToProperType(Number('text'), 'boolean')).to.eql(NaN);
  });
});
