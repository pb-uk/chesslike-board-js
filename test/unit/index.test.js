// test/unit/index.test.js

import { version } from '../../src/index';
import { version as pkgVersion } from '../../package.json';

describe('The global entry point', () => {
  it('should have the same version as package.json', () => {
    expect(version).toMatch(pkgVersion);
  });
});
