export const spaces = /\s/g;
export const allBrackets = /\[:|:\]/g;

export const regexExtract = {
  parenthesesContent: /(?<=\()[^\(\)]+(?=\))/,
  bracesContent: /(?<={)(.|[\n\s\r])+(?=}(?!}))/,
};

export const getRegexMatch = (regExp: RegExp, input: string): string => {
  const result = input.match(regExp);
  if (result) {
    return result[0];
  }
  return "";
};
