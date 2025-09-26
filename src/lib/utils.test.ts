import { maskPhone, formatDate, truncateText } from './utils';

describe('maskPhone', () => {
  test('masks international phone numbers correctly', () => {
    expect(maskPhone('+14155551234')).toBe('+141*****34');
    expect(maskPhone('+33123456789')).toBe('+331*****89');
    expect(maskPhone('+447911123456')).toBe('+447*****56');
  });

  test('masks domestic phone numbers correctly', () => {
    expect(maskPhone('4155551234')).toBe('415*****34');
    expect(maskPhone('1234567890')).toBe('123*****90');
  });

  test('handles short phone numbers', () => {
    expect(maskPhone('1234')).toBe('1**4');
    expect(maskPhone('12345')).toBe('1***5');
    expect(maskPhone('123')).toBe('123');
  });

  test('handles edge cases', () => {
    expect(maskPhone('')).toBe('');
    expect(maskPhone('1')).toBe('1');
    expect(maskPhone('12')).toBe('12');
    expect(maskPhone('+1')).toBe('+1');
  });

  test('handles invalid input gracefully', () => {
    expect(maskPhone(null as any)).toBe(null);
    expect(maskPhone(undefined as any)).toBe(undefined);
    expect(maskPhone(123 as any)).toBe(123);
  });

  test('preserves whitespace handling', () => {
    expect(maskPhone(' +14155551234 ')).toBe('+141*****34');
    expect(maskPhone('  4155551234  ')).toBe('415*****34');
  });
});

describe('formatDate', () => {
  test('formats valid date strings', () => {
    const dateString = '2023-12-25T10:30:00.000Z';
    const formatted = formatDate(dateString);
    expect(formatted).toMatch(/Dec 25, 2023/);
  });

  test('handles invalid date strings', () => {
    expect(formatDate('invalid-date')).toBe('invalid-date');
    expect(formatDate('')).toBe('');
  });

  test('handles edge cases', () => {
    expect(formatDate('2023-01-01T00:00:00.000Z')).toMatch(/Jan 1, 2023/);
  });
});

describe('truncateText', () => {
  test('truncates long text with ellipsis', () => {
    const longText = 'This is a very long text that should be truncated';
    expect(truncateText(longText, 20)).toBe('This is a very lo...');
  });

  test('returns short text unchanged', () => {
    const shortText = 'Short text';
    expect(truncateText(shortText, 20)).toBe('Short text');
  });

  test('handles edge cases', () => {
    expect(truncateText('', 10)).toBe('');
    expect(truncateText('abc', 3)).toBe('abc');
    expect(truncateText('abcd', 3)).toBe('...');
  });

  test('uses default max length', () => {
    const longText = 'a'.repeat(60);
    const result = truncateText(longText);
    expect(result).toHaveLength(50);
    expect(result.endsWith('...')).toBe(true);
  });
});
