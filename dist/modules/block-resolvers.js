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
const isString = /^".+"$/;
const isNumber = /^[1-9][0-9]*\.{0,1}[0-9]*$/;
const getVariableValue = (variableName, data) => {
    if (isString.test(variableName)) {
        return variableName.slice(1, -1);
    }
    if (isNumber.test(variableName)) {
        return Number.parseFloat(variableName);
    }
    return (0, utils_1.getDeepvalue)(data, variableName, null);
};
const resolveIfBlock = (ifBlock, data) => {
    for (const chainElement of ifBlock.chain) {
        if (chainElement.type === "else") {
            return chainElement.result;
        }
        const { condition } = chainElement;
        if (condition.type === "truthinessCheck") {
            const value = !!(0, utils_1.getDeepvalue)(data, condition.variableName);
            if ((value && !condition.inverted) || (!value && condition.inverted)) {
                return condition.result;
            }
        }
        if (condition.type === "comparison") {
            const { leftHandVariable, rightHandVariable } = condition;
            const valueA = getVariableValue(leftHandVariable, data);
            const valueB = getVariableValue(rightHandVariable, data);
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
    const array = (0, utils_1.getDeepvalue)(data, forBlock.arrayName, null);
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
