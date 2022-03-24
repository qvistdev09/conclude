"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeepvalue = exports.getRegexMatch = exports.regexExtract = exports.allBrackets = exports.spaces = void 0;
exports.spaces = /\s/g;
exports.allBrackets = /\[:|:\]/g;
exports.regexExtract = {
    parenthesesContent: /(?<=\()[^\(\)]+(?=\))/,
    bracesContent: /(?<={)(.|[\n\s\r])+(?=}(?!}))/,
};
const getRegexMatch = (regExp, input) => {
    const result = input.match(regExp);
    if (result) {
        return result[0];
    }
    return "";
};
exports.getRegexMatch = getRegexMatch;
const getDeepvalue = (data, path, defaultValue = null) => {
    return path
        .split(".")
        .filter((str) => str !== "")
        .reduce((object, field) => object === undefined || object === defaultValue ? defaultValue : object[field], data);
};
exports.getDeepvalue = getDeepvalue;
