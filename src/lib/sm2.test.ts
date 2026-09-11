import { describe, it, expect } from 'vitest';
import { getInterval } from './sm2';

describe('SM-2 Algorithm Interval Logic', () => {
  it('should return an interval of 1 for the first repetition', () => {
    expect(getInterval(1, 2.5)).toBe(1);
    expect(getInterval(1, 1.3)).toBe(1); // Regardless of ease
  });

  it('should return an interval of 6 for the second repetition', () => {
    expect(getInterval(2, 2.5)).toBe(6);
    expect(getInterval(2, 1.3)).toBe(6);
  });

  it('should correctly calculate subsequent intervals based on easeFactor', () => {
    // 3rd repetition with ease 2.5: 6 * (2.5)^(3-2) = 15
    expect(getInterval(3, 2.5)).toBe(15);
    
    // 4th repetition with ease 2.5: 6 * (2.5)^(4-2) = 6 * 6.25 = 37.5 -> round to 38
    expect(getInterval(4, 2.5)).toBe(38);

    // 3rd repetition with low ease 1.3: 6 * 1.3 = 7.8 -> round to 8
    expect(getInterval(3, 1.3)).toBe(8);
  });
});
