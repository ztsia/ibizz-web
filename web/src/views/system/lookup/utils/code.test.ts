import { describe, it, expect } from 'vitest';
import { suggestNextCode } from './code';

describe('suggestNextCode (numeric lenient)', () => {
  it('pads based on observed length when no fixed length', () => {
    const existing = ['001', '002'];
    const suggested = suggestNextCode(String.raw`^\d+$`, existing);
    expect(suggested).toBe('003');
  });

  it('pads based on regex fixed length when provided', () => {
    const existing: string[] = [];
    const suggested = suggestNextCode(String.raw`^\d{4}$`, existing);
    expect(suggested).toBe('0001');
  });

  it('strips non-digits and infers padding from observed digits', () => {
    const existing = ['AB01', 'AB02'];
    const suggested = suggestNextCode(String.raw`^\d+$`, existing);
    expect(suggested).toBe('03');
  });

  it('handles mixture of clean and noisy numeric entries', () => {
    const existing = ['5', 'A07', '009'];
    const suggested = suggestNextCode(String.raw`^\d+$`, existing);
    // numeric values: 5,7,9 -> max=9 -> next=10 -> observed max len = 3 so pad to 3 -> '010'
    expect(suggested).toBe('010');
  });
});
