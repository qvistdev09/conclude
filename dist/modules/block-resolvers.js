"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveInterpolationBlock = exports.resolveForBlock = exports.resolveIfBlock = void 0;
const escape_1 = require("./escape");
const utils_1 = require("./utils");
const operatorCompare = (operator, valueA, valueB) => {
    switch (operator) {
        case "<":
            return valueA < valueB;
        case ">":
            return valueA > valueB;
        case "<=":
            return valueA <= valueB;
        case ">=":
            return valueA >= valueB;
        case "=":
            return valueA === valueB;
        case "!=":
            return valueA !== valueB;
        default:
            return false;
    }
};
const resolveIfBlock = (ifBlock, data) => {
    for (const chainElement of ifBlock.chain) {
        if (chainElement.type === "else") {
            return chainElement.result;
        }
        const { condition } = chainElement;
        if (condition.type === "truthinessCheck") {
            const value = !!data[condition.variableName];
            if ((value && !condition.inverted) || (!value && condition.inverted)) {
                return condition.result;
            }
        }
        if (condition.type === "comparison") {
            const valueA = data[condition.leftHandVariable];
            const valueB = data[condition.rightHandVariable];
            const { operator } = condition;
            if (operatorCompare(operator, valueA, valueB)) {
                return condition.result;
            }
        }
    }
    return "";
};
exports.resolveIfBlock = resolveIfBlock;
const resolveForBlock = (forBlock, data) => {
    const array = data[forBlock.arrayName];
    if (!array || !Array.isArray(array)) {
        return "";
    }
    return array.reduce((output, value, index) => {
        const identifier = `${forBlock.itemName}${index}`;
        data[identifier] = value;
        output += forBlock.forBody.replace(new RegExp(forBlock.itemName, "g"), identifier);
        return output;
    }, "");
};
exports.resolveForBlock = resolveForBlock;
const resolveInterpolationBlock = (interpolationBlock, data) => {
    const value = (0, utils_1.getDeepvalue)(data, interpolationBlock.variableName);
    if (typeof value === "string") {
        return (0, escape_1.escapeString)(value);
    }
    if (typeof value === "number") {
        return (0, escape_1.escapeString)(value.toString());
    }
    return "";
};
exports.resolveInterpolationBlock = resolveInterpolationBlock;
