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

export const getDeepvalue = (data: any, path: string, defaultValue = null) => {
  return path
    .split(".")
    .filter((str) => str !== "")
    .reduce(
      (object, field) =>
        object === undefined || object === defaultValue ? defaultValue : object[field],
      data
    );
};
