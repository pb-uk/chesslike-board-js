// test/func/index.test.js

const { version } = require('../..');
const { SEMVER } = require('../helpers');

describe('Functional tests run against the Common JS module', () => {
  describe('The boilerplate source code', () => {
    it('should have a version', () => {
      expect(version).toMatch(SEMVER);
    });
  });
});
