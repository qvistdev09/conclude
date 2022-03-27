import { escapeString } from "./escape";
import { Blocks } from "./types";
import { getDeepvalue } from "./utils";

const operatorCompare = (operator: string, valueA: any, valueB: any): boolean => {
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

const getVariableValue = (variableName: string, data: any) => {
  if (isString.test(variableName)) {
    return variableName.slice(1, -1);
  }
  if (isNumber.test(variableName)) {
    return Number.parseFloat(variableName);
  }
  return getDeepvalue(data, variableName, null);
};

export const resolveIfBlock = (ifBlock: Blocks.If, data: any): string => {
  for (const chainElement of ifBlock.chain) {
    if (chainElement.type === "else") {
      return chainElement.result;
    }
    const { condition } = chainElement;
    if (condition.type === "truthinessCheck") {
      const value = !!getDeepvalue(data, condition.variableName);
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

export const resolveForBlock = (forBlock: Blocks.For, data: any): string => {
  const array = getDeepvalue(data, forBlock.arrayName, null);
  if (!array || !Array.isArray(array)) {
    return "";
  }
  return array.reduce((output: string, value, index) => {
    const identifier = `${forBlock.itemName}${index}`;
    data[identifier] = value;
    output += forBlock.forBody.replace(new RegExp(forBlock.itemName, "g"), identifier);
    return output;
  }, "");
};

export const resolveInterpolationBlock = (
  interpolationBlock: Blocks.Interpolation,
  data: any
): string => {
  const value = getDeepvalue(data, interpolationBlock.variableName);
  if (typeof value === "string") {
    return escapeString(value);
  }
  if (typeof value === "number") {
    return escapeString(value.toString());
  }
  return "";
};
