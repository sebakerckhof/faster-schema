import { expect } from 'chai';
import filterKeys from './filterKeys';

const keys = [
  'user',
  'user.name',
  'user.password',
  'user.password.hash',
  'user.password.algorithm',
  'services',
  'services.$',
  'services.$.name',
  'services.$.configs',
  'foo',
  'foo.bar',
  'bar',
  'fooBar',
];

function checkFilter(filter, expected, match = true) {
  expect(filterKeys(keys, filter, match)).to.eql(expected);
}

describe('filterKeys', function () {
  it('should filter keys', function () {
    checkFilter(['foo', 'bar'], ['foo', 'bar']);
  });

  it('should filter wildcards', function () {
    checkFilter(['user.*'], ['user', 'user.name', 'user.password', 'user.password.hash', 'user.password.algorithm']);
  });

  it('should include ancestors', function () {
    checkFilter(['user.password.hash'], ['user', 'user.password', 'user.password.hash']);
    checkFilter(['user.password.*'], ['user', 'user.password', 'user.password.hash', 'user.password.algorithm']);
  });

  it('should inverse', function () {
    checkFilter(['user.password.hash'], [
      'user',
      'user.name',
      'user.password',
      'user.password.algorithm',
      'services',
      'services.$',
      'services.$.name',
      'services.$.configs',
      'foo',
      'foo.bar',
      'bar',
      'fooBar',
    ], false);
    // checkFilter(['user.password'], [
    //   'user',
    //   'user.name',
    //   'services',
    //   'services.$',
    //   'services.$.name',
    //   'services.$.configs',
    //   'foo',
    //   'foo.bar',
    //   'bar',
    //   'fooBar',
    // ], false);
    // checkFilter(['user.*'], [
    //   'user',
    //   'services',
    //   'services.$',
    //   'services.$.name',
    //   'services.$.configs',
    //   'foo',
    //   'foo.bar',
    //   'bar',
    //   'fooBar',
    // ], false);
  });
});
