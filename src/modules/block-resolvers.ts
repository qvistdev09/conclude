import { escapeString } from "./escape";
import { Blocks } from "./types";

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

export const resolveIfBlock = (ifBlock: Blocks.If, data: any): string => {
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

export const resolveForBlock = (forBlock: Blocks.For, data: any): string => {
  const array = data[forBlock.arrayName];
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
  const value = data[interpolationBlock.variableName];
  if (typeof value === "string") {
    return escapeString(value);
  }
  if (typeof value === "number") {
    return escapeString(value.toString());
  }
  return "";
};
