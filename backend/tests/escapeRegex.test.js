const escapeRegex = require('../utils/escapeRegex');

describe('escapeRegex', () => {
    it('escapes regex metacharacters', () => {
        expect(escapeRegex('abc.*+?')).toBe('abc\\.\\*\\+\\?');
        expect(escapeRegex('(test)[x]')).toBe('\\(test\\)\\[x\\]');
    });

    it('returns empty string for invalid input', () => {
        expect(escapeRegex('')).toBe('');
        expect(escapeRegex(null)).toBe('');
    });

    it('leaves normal alphanumeric search terms unchanged', () => {
        expect(escapeRegex('MH12AB1234')).toBe('MH12AB1234');
    });
});
