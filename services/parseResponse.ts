export interface ParsedResponse {
  correction?: string;
  story: string;
}

export const parseResponse = (responseText: string): ParsedResponse => {
  const correctionPrefix = "Correction: ";
  const lines = responseText.split('\n');
  if (lines.length > 0 && lines[0].startsWith(correctionPrefix)) {
    let correction = lines[0].substring(correctionPrefix.length).trim();
    if (
      (correction.startsWith('"') && correction.endsWith('"')) ||
      (correction.startsWith("'") && correction.endsWith("'"))
    ) {
      correction = correction.slice(1, -1);
    }
    const story = lines.slice(1).join('\n').trim();
    return { correction, story };
  }
  return { story: responseText };
};
