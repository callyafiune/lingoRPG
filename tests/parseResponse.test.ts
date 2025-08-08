import { describe, it, expect } from 'vitest';
import { parseResponse } from '../services/parseResponse';

describe('parseResponse', () => {
  it('extracts correction with quotes and narrative', () => {
    const input = 'Correction: "I go to the cave."\nYou enter the cave.';
    const result = parseResponse(input);
    expect(result).toEqual({
      correction: 'I go to the cave.',
      story: 'You enter the cave.'
    });
  });

  it('handles response without correction', () => {
    const input = 'You enter the cave.';
    const result = parseResponse(input);
    expect(result).toEqual({ story: 'You enter the cave.' });
  });

  it('extracts correction without quotes', () => {
    const input = 'Correction: I go to the cave.\nYou enter the cave.';
    const result = parseResponse(input);
    expect(result).toEqual({
      correction: 'I go to the cave.',
      story: 'You enter the cave.'
    });
  });
});
