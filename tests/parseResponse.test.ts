import { describe, it, expect } from 'vitest';
import { parseResponse } from '../utils/parseResponse';

describe('parseResponse', () => {
  it('parses response with correction and narrative', () => {
    const response = 'Correction: "Use the correct phrase"\nOnce upon a time';
    const result = parseResponse(response);
    expect(result).toEqual({ correction: 'Use the correct phrase', story: 'Once upon a time' });
  });

  it('parses response without correction', () => {
    const response = 'Just a story without correction';
    const result = parseResponse(response);
    expect(result).toEqual({ story: 'Just a story without correction' });
  });

  it('parses response with correction without quotes', () => {
    const response = 'Correction: Use the correct phrase\nAnother story';
    const result = parseResponse(response);
    expect(result).toEqual({ correction: 'Use the correct phrase', story: 'Another story' });
  });
});
