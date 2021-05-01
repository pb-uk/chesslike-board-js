// test/func/index.test.js

const cjsModule = require('../..');
const { version, main } = require('../../package.json');

describe('The Common JS module', () => {
  it('should be pointed to by `main` in package.json', () => {
    expect(main).toBe('dist/cjs/index.js');
  });

  it('should have the same version as package.json', () => {
    expect(cjsModule.version).toBe(version);
  });

  it('should only expose documented methods', () => {
    const exposes = Object.keys(cjsModule).sort();
    expect(exposes).toEqual(['createBoard', 'version']);
  });
});
