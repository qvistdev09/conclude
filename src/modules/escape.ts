const charsToEscape = /[&<>"']/g;

const escapeMap: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
} as const;

export const escapeString = (input: string): string =>
  input.replace(charsToEscape, (matchedCharacter) => escapeMap[matchedCharacter]);
