import { ForShard, IfShard, InterpolationShard } from "./types";

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

const resolveIfShard = (ifShard: IfShard, data: any): string => {
  for (const chainElement of ifShard.chain) {
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

const resolveForShard = (forShard: ForShard, data: any): string => {
  const array = data[forShard.arrayName];
  if (!array || !Array.isArray(array)) {
    return "";
  }
  let output = "";
  array.forEach((value, index) => {
    const identifier = `${forShard.itemName}${index}`;
    data[identifier] = value;
    output += forShard.forBody.replace(new RegExp(forShard.itemName, "g"), identifier);
  });
  return output;
};

const resolveInterpolationShard = (shard: InterpolationShard, data: any): string => {
  const value = data[shard.variableName];
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return value.toString();
  }
  return "";
};

export default {
  resolveIfShard,
  resolveForShard,
  resolveInterpolationShard,
};
