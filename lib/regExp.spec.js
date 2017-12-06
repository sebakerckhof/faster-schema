import { expect } from 'chai';
import FasterSchema from './FasterSchema';

describe('RegExp', function () {
  it('FasterSchema.RegEx.Email', function () {
    const expr = FasterSchema.RegEx.Email;

    function isTrue(s) {
      expect(expr.test(s)).to.be.true;
    }

    function isFalse(s) {
      expect(expr.test(s)).to.be.false;
    }

    isTrue('name@web.de');
    isTrue('name+addition@web.de');
    isTrue('st#r~ange.e+mail@web.de');
    isTrue('name@localhost');
    isTrue('name@192.168.200.5');
    isFalse('name@BCDF:45AB:1245:75B9:0987:1562:4567:1234');
    isFalse('name@BCDF:45AB:1245:75B9::0987:1234:1324');
    isFalse('name@BCDF:45AB:1245:75B9:0987:1234:1324');
    isFalse('name@::1');
  });

  it('FasterSchema.RegEx.EmailWithTLD', function () {
    const expr = FasterSchema.RegEx.EmailWithTLD;

    function isTrue(s) {
      expect(expr.test(s)).to.be.true;
    }

    function isFalse(s) {
      expect(expr.test(s)).to.be.false;
    }

    isTrue('name@web.de');
    isTrue('name+addition@web.de');
    isTrue('st#r~ange.e+mail@web.de');
    isFalse('name@localhost');
    isFalse('name@192.168.200.5');
    isFalse('name@BCDF:45AB:1245:75B9:0987:1562:4567:1234');
    isFalse('name@BCDF:45AB:1245:75B9::0987:1234:1324');
    isFalse('name@BCDF:45AB:1245:75B9:0987:1234:1324');
    isFalse('name@::1');
  });

  it('FasterSchema.RegEx.Domain', function () {
    const expr = FasterSchema.RegEx.Domain;

    function isTrue(s) {
      expect(expr.test(s)).to.be.true;
    }

    function isFalse(s) {
      expect(expr.test(s)).to.be.false;
    }

    isTrue('domain.com');
    isFalse('localhost');
    isFalse('192.168.200.5');
    isFalse('BCDF:45AB:1245:75B9:0987:1562:4567:1234:AB36');
  });

  it('FasterSchema.RegEx.WeakDomain', function () {
    const expr = FasterSchema.RegEx.WeakDomain;

    function isTrue(s) {
      expect(expr.test(s)).to.be.true;
    }

    isTrue('domain.com');
    isTrue('localhost');
    isTrue('192.168.200.5');
    isTrue('BCDF:45AB:1245:75B9:0987:1562:4567:1234');
  });

  it('FasterSchema.RegEx.IP', function () {
    const expr = FasterSchema.RegEx.IP;

    function isTrue(s) {
      expect(expr.test(s)).to.be.true;
    }

    function isFalse(s) {
      expect(expr.test(s)).to.be.false;
    }

    isFalse('localhost');
    isTrue('192.168.200.5');
    isFalse('320.168.200.5');
    isFalse('192.168.5');
    isTrue('BCDF:45AB:1245:75B9:0987:1562:4567:1234');
    isFalse('BCDF:45AB:1245:75B9:0987:1562:4567:1234:AB36');
    isTrue('BCDF:45AB:1245:75B9::0987:1234:1324');
    isFalse('BCDF:45AB:1245:75B9:0987:1234:1324');
    isTrue('::1');
  });

  it('FasterSchema.RegEx.IPv4', function () {
    const expr = FasterSchema.RegEx.IPv4;

    function isTrue(s) {
      expect(expr.test(s)).to.be.true;
    }

    function isFalse(s) {
      expect(expr.test(s)).to.be.false;
    }

    isFalse('localhost');
    isTrue('192.168.200.5');
    isFalse('320.168.200.5');
    isFalse('192.168.5');
    isFalse('BCDF:45AB:1245:75B9:0987:1562:4567:1234');
    isFalse('BCDF:45AB:1245:75B9:0987:1562:4567:1234:AB36');
    isFalse('BCDF:45AB:1245:75B9::0987:1234:1324');
    isFalse('BCDF:45AB:1245:75B9:0987:1234:1324');
    isFalse('::1');
  });

  it('FasterSchema.RegEx.IPv6', function () {
    const expr = FasterSchema.RegEx.IPv6;

    function isTrue(s) {
      expect(expr.test(s)).to.be.true;
    }

    function isFalse(s) {
      expect(expr.test(s)).to.be.false;
    }

    isFalse('localhost');
    isFalse('192.168.200.5');
    isFalse('320.168.200.5');
    isFalse('192.168.5');
    isTrue('BCDF:45AB:1245:75B9:0987:1562:4567:1234');
    isFalse('BCDF:45AB:1245:75B9:0987:1562:4567:1234:AB36');
    isTrue('BCDF:45AB:1245:75B9::0987:1234:1324');
    isFalse('BCDF:45AB:1245:75B9:0987:1234:1324');
    isTrue('::1');
  });
});
