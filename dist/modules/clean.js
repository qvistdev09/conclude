"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spacesBetweenTags = /(?<=>)\s+(?=<)/g;
const lineBreaks = /[\r\n]/g;
const bracesSpace = /(?<={)\s*|\s*(?=})/g;
const parenthesesSpace = /(?<=\()\s*|\s*(?=\))/g;
const angleBracketsSpace = /(?<=>)\s*|\s*(?=<)/g;
const spacesBetweenDelimiters = /(?<=:\])\s*|\s*(?=\[:)/g;
const cleanOutput = (template) => {
    return template
        .replace(spacesBetweenTags, "")
        .replace(lineBreaks, "")
        .replace(bracesSpace, "")
        .replace(parenthesesSpace, "")
        .replace(angleBracketsSpace, "")
        .replace(spacesBetweenDelimiters, "");
};
exports.default = {
    cleanOutput,
};
