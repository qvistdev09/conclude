"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeString = void 0;
const charsToEscape = /[&<>"']/g;
const escapeMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
};
const escapeString = (input) => input.replace(charsToEscape, (matchedCharacter) => escapeMap[matchedCharacter]);
exports.escapeString = escapeString;
