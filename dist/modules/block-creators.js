"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendHtmlBlock = exports.appendInterpolationBlock = exports.appendForBlock = exports.appendElseBlock = exports.appendIfBlock = void 0;
const utils_1 = require("./utils");
const createIfBlockConditional = (input) => {
    const conditionElements = (0, utils_1.getRegexMatch)(utils_1.regexExtract.parenthesesContent, input).split(" ");
    const result = (0, utils_1.getRegexMatch)(utils_1.regexExtract.bracesContent, input);
    if (conditionElements.length === 1 &&
        conditionElements[0].length > 1 &&
        conditionElements[0][0] === "!") {
        const variableName = conditionElements[0].slice(1);
        return {
            type: "truthinessCheck",
            inverted: true,
            variableName,
            result,
        };
    }
    if (conditionElements.length === 1) {
        const variableName = conditionElements[0];
        return {
            type: "truthinessCheck",
            inverted: false,
            variableName,
            result,
        };
    }
    if (conditionElements.length === 3) {
        const [leftHandVariable, operator, rightHandVariable] = conditionElements;
        return {
            type: "comparison",
            leftHandVariable,
            rightHandVariable,
            operator,
            result,
        };
    }
    return null;
};
const appendIfBlock = (input, blocks) => {
    const conditionObject = createIfBlockConditional(input);
    if (conditionObject) {
        blocks.push({
            type: "if",
            chain: [
                {
                    type: "if",
                    condition: conditionObject,
                },
            ],
            chainClosed: false,
        });
    }
};
exports.appendIfBlock = appendIfBlock;
const appendElseBlock = (input, type, blocks) => {
    const lastBlock = blocks.length > 0 ? blocks[blocks.length - 1] : null;
    if (lastBlock && lastBlock.type === "if" && !lastBlock.chainClosed) {
        if (type === "elseIf") {
            const conditionObject = createIfBlockConditional(input);
            if (conditionObject) {
                lastBlock.chain.push({
                    type: "elseIf",
                    condition: conditionObject,
                });
                return;
            }
        }
        lastBlock.chain.push({
            type: "else",
            result: (0, utils_1.getRegexMatch)(utils_1.regexExtract.bracesContent, input),
        });
        lastBlock.chainClosed = true;
    }
};
exports.appendElseBlock = appendElseBlock;
const appendForBlock = (input, blocks) => {
    const [itemName, , arrayName] = (0, utils_1.getRegexMatch)(utils_1.regexExtract.parenthesesContent, input).split(" ");
    const forBody = (0, utils_1.getRegexMatch)(utils_1.regexExtract.bracesContent, input);
    blocks.push({
        type: "for",
        itemName,
        arrayName,
        forBody,
    });
};
exports.appendForBlock = appendForBlock;
const appendInterpolationBlock = (input, blocks) => {
    const variableName = input.replace(utils_1.allBrackets, "").replace(utils_1.spaces, "");
    blocks.push({
        type: "interpolation",
        variableName,
    });
};
exports.appendInterpolationBlock = appendInterpolationBlock;
const appendHtmlBlock = (input, blocks) => {
    blocks.push({
        type: "html",
        content: input,
    });
};
exports.appendHtmlBlock = appendHtmlBlock;
