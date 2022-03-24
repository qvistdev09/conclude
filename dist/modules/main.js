"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConcludeEngine = void 0;
const block_creators_1 = require("./block-creators");
const block_resolvers_1 = require("./block-resolvers");
const include_1 = require("./include");
const store_1 = require("./store");
const delimiters = /(\[:|:\])/g;
const leftDelimiter = /\[:/g;
const rightDelimiter = /:\]/g;
const blocksRegexes = {
    if: /^\[:#IF\s+\(.+\)\s+THEN\s+{(.|[\n\s\r])+}:\]$/,
    elseIf: /^\[:#ELSE_IF\s+\(.+\)\s+THEN\s+{(.|[\n\s\r])+}:\]$/,
    else: /^\[:#ELSE\s+{(.|[\n\s\r])+}:\]$/,
    for: /^\[:#FOR\s\(.+\sIN\s.+\)\s{(.|[\n\s\r])+}:\]$/,
    interpolation: /^\[:(?!.*\[:).+(?<!:\].*):\]$/,
    empty: /^\s*$/,
};
const fragmentTemplate = (template) => {
    return template.split(delimiters).filter((str) => str !== "");
};
const balancedDelimiters = (str) => {
    var _a, _b;
    return ((_a = str.match(leftDelimiter)) === null || _a === void 0 ? void 0 : _a.length) === ((_b = str.match(rightDelimiter)) === null || _b === void 0 ? void 0 : _b.length);
};
const createAndAppendBlock = (input, blocks) => {
    if (blocksRegexes.empty.test(input)) {
        return;
    }
    if (blocksRegexes.if.test(input)) {
        (0, block_creators_1.appendIfBlock)(input, blocks);
        return;
    }
    if (blocksRegexes.elseIf.test(input)) {
        (0, block_creators_1.appendElseBlock)(input, "elseIf", blocks);
        return;
    }
    if (blocksRegexes.else.test(input)) {
        (0, block_creators_1.appendElseBlock)(input, "else", blocks);
        return;
    }
    if (blocksRegexes.for.test(input)) {
        (0, block_creators_1.appendForBlock)(input, blocks);
        return;
    }
    if (blocksRegexes.interpolation.test(input)) {
        (0, block_creators_1.appendInterpolationBlock)(input, blocks);
        return;
    }
    (0, block_creators_1.appendHtmlBlock)(input, blocks);
};
const consolidateFragments = (fragmentedTemplate, blocks = []) => {
    if (fragmentedTemplate.length === 0) {
        return blocks;
    }
    const [fragment] = fragmentedTemplate;
    if (fragmentedTemplate.length === 1) {
        createAndAppendBlock(fragment, blocks);
        return blocks;
    }
    if (balancedDelimiters(fragment)) {
        createAndAppendBlock(fragment, blocks);
        return consolidateFragments(fragmentedTemplate.slice(1), blocks);
    }
    if (!leftDelimiter.test(fragment) && !rightDelimiter.test(fragment)) {
        (0, block_creators_1.appendHtmlBlock)(fragment, blocks);
        return consolidateFragments(fragmentedTemplate.slice(1), blocks);
    }
    const joinedFragments = `${fragmentedTemplate[0]}${fragmentedTemplate[1]}`;
    return consolidateFragments([joinedFragments, ...fragmentedTemplate.slice(2)], blocks);
};
const parseTemplateIntoBlocks = (template) => {
    const fragmented = fragmentTemplate(template);
    return consolidateFragments(fragmented);
};
const resolveBlockSurfaceLayer = (block, data) => {
    return block.type === "for"
        ? (0, block_resolvers_1.resolveForBlock)(block, data)
        : block.type === "if"
            ? (0, block_resolvers_1.resolveIfBlock)(block, data)
            : (0, block_resolvers_1.resolveInterpolationBlock)(block, data);
};
const deepResolveBlock = (block, data) => {
    if (block.type === "html") {
        return block.content;
    }
    const resolvedOuterLayer = resolveBlockSurfaceLayer(block, data);
    return parseTemplateIntoBlocks(resolvedOuterLayer).reduce((output, currentBlock) => (output += deepResolveBlock(currentBlock, data)), "");
};
const resolveRecursively = (template, data) => parseTemplateIntoBlocks(template).reduce((output, block) => (output += deepResolveBlock(block, data)), "");
class ConcludeEngine {
    constructor(templatesFolder) {
        const importedStore = (0, store_1.createStore)(templatesFolder);
        this.store = (0, include_1.resolveStoreIncludes)(importedStore);
    }
    renderTemplate(templateName, data) {
        return resolveRecursively(this.store[templateName], data);
    }
}
exports.ConcludeEngine = ConcludeEngine;
