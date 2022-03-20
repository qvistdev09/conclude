const spacesBetweenTags = /(?<=>)\s+(?=<)/g;
const lineBreaks = /[\r\n]/g;
const bracesSpace = /(?<={)\s*|\s*(?=})/g;
const parenthesesSpace = /(?<=\()\s*|\s*(?=\))/g;
const angleBracketsSpace = /(?<=>)\s*|\s*(?=<)/g;

const cleanOutput = (template: string): string => {
  return template
    .replace(spacesBetweenTags, "")
    .replace(lineBreaks, "")
    .replace(bracesSpace, "")
    .replace(parenthesesSpace, "")
    .replace(angleBracketsSpace, "");
};

export default {
  cleanOutput,
};
