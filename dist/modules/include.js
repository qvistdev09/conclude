"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveStoreIncludes = void 0;
const utils_1 = require("./utils");
const includeBlocksRegex = /\[:#INCLUDE\s"[^\[\]]*":\]/g;
const extractIncludeKey = /(?<=").+(?=")/;
const createIncludeBlockRegex = (key) => new RegExp('[\\[]:#INCLUDE\\s"' + key + '":[\\]]', "g");
const resolveTemplateIncludes = (template, templatesMap, history = []) => {
    const includeBlocks = (template.match(includeBlocksRegex) || []).filter((value, index, array) => array.indexOf(value) === index);
    if (includeBlocks.length === 0) {
        return template;
    }
    const branchedHistory = [...history];
    const resolvedTemplate = includeBlocks.reduce((templateBody, includeBlock) => {
        const templateKey = (0, utils_1.getRegexMatch)(extractIncludeKey, includeBlock);
        if (templateKey) {
            const circularImport = branchedHistory.includes(templateKey);
            const replaceContent = circularImport ? "" : templatesMap[templateKey];
            if (!circularImport) {
                branchedHistory.push(templateKey);
            }
            return templateBody.replace(createIncludeBlockRegex(templateKey), replaceContent);
        }
        return templateBody;
    }, template);
    return resolveTemplateIncludes(resolvedTemplate, templatesMap, branchedHistory);
};
const resolveStoreIncludes = (store) => {
    const resolvedStore = {};
    Object.keys(store).forEach((key) => {
        resolvedStore[key] = resolveTemplateIncludes(store[key], store);
    });
    return resolvedStore;
};
exports.resolveStoreIncludes = resolveStoreIncludes;
