import { ForShard, IfWrapper, InterpolationShard, Shard } from "./types";

const spaces = /\s/g;
const allBrackets = /\[:|:\]/g;
const delimiters = /(\[:|:\])/g;
const leftDelimiter = /\[:/g;
const rightDelimiter = /:\]/g;

const shards = {
  if: /^\[:#IF\s+\(.+\)\s+THEN\s+{(.|[\n\s\r])+}:\]$/,
  elseIf: /^\[:#ELSE_IF\s+\(.+\)\s+THEN\s+{(.|[\n\s\r])+}:\]$/,
  else: /^\[:#ELSE\s+{(.|[\n\s\r])+}:\]$/,
  for: /^\[:#FOR\s\(.+\sIN\s.+\)\s{(.|[\n\s\r])+}:\]$/,
  interpolation: /^\[:(?!.*\[:).+(?<!:\].*):\]$/,
  empty: /^\s*$/,
};

const extract = {
  parenthesesContent: /(?<=\()[^\(\)]+(?=\))/,
  bracesContent: /(?<={)(.|[\n\s\r])+(?=}(?!}))/,
};

const fragmentTemplate = (template: string) => {
  return template.split(delimiters).filter((str) => str !== "");
};

const balancedDelimiters = (str: string) => {
  return str.match(leftDelimiter)?.length === str.match(rightDelimiter)?.length;
};

const categorizeShard = (str: string): Shard => {
  if (shards.if.test(str)) {
    return {
      type: "ifWrapper",
      parts: [
        {
          type: "if",
          content: str,
        },
      ],
      chainClosed: false,
    };
  }
  if (shards.elseIf.test(str)) {
    return {
      type: "elseIf",
      content: str,
    };
  }
  if (shards.else.test(str)) {
    return {
      type: "else",
      content: str,
    };
  }
  if (shards.for.test(str)) {
    return {
      type: "for",
      content: str,
    };
  }
  if (shards.interpolation.test(str)) {
    return {
      type: "interpolation",
      content: str,
    };
  }
  if (shards.empty.test(str)) {
    return {
      type: "empty",
    };
  }
  return {
    type: "html",
    content: str,
  };
};

const appendShardToArray = (shard: Shard, shardArray: Shard[]): Shard[] => {
  if (shard.type === "empty") {
    return shardArray;
  }
  const lastShard = shardArray.length > 0 ? shardArray[shardArray.length - 1] : null;
  if (lastShard && lastShard.type === "ifWrapper" && !lastShard.chainClosed) {
    if (shard.type === "elseIf") {
      lastShard.parts.push(shard);
      return shardArray;
    }
    if (shard.type === "else") {
      lastShard.parts.push(shard);
      lastShard.chainClosed = true;
      return shardArray;
    }
  }
  if (shard.type !== "else" && shard.type !== "elseIf") {
    shardArray.push(shard);
  }
  return shardArray;
};

const consolidateShards = (fragmentedTemplate: string[], consolidated: Shard[] = []): Shard[] => {
  const [fragment] = fragmentedTemplate;
  if (!fragment) {
    return [
      {
        type: "empty",
      },
    ];
  }
  if (fragmentedTemplate.length === 1) {
    appendShardToArray(categorizeShard(fragment), consolidated);
    return consolidated;
  }
  if (balancedDelimiters(fragment)) {
    appendShardToArray(categorizeShard(fragment), consolidated);
    return consolidateShards(fragmentedTemplate.slice(1), consolidated);
  }
  if (!leftDelimiter.test(fragment) && !rightDelimiter.test(fragment)) {
    consolidated.push({
      type: "html",
      content: fragment,
    });
    return consolidateShards(fragmentedTemplate.slice(1), consolidated);
  }
  const joinedFragments = `${fragmentedTemplate[0]}${fragmentedTemplate[1]}`;
  return consolidateShards([joinedFragments, ...fragmentedTemplate.slice(2)], consolidated);
};

const splitTemplate = (template: string): Shard[] => {
  const fragmented = fragmentTemplate(template);
  return consolidateShards(fragmented);
};

const getMatch = (regex: RegExp, str: string) => {
  const result = str.match(regex);
  if (result) {
    return result[0];
  }
  return "";
};

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

const resolveConditionalShard = (ifWrapper: IfWrapper, data: any): string => {
  for (const conditionalShard of ifWrapper.parts) {
    if (conditionalShard.type === "else") {
      const result = getMatch(extract.bracesContent, conditionalShard.content);
      return result;
    }
    const condition = getMatch(extract.parenthesesContent, conditionalShard.content);
    const result = getMatch(extract.bracesContent, conditionalShard.content);
    const conditionParts = condition.split(" ");

    if (conditionParts.length === 1 && !!data[condition]) {
      return result;
    }

    if (conditionParts.length === 3) {
      const [propertyA, operator, propertyB] = conditionParts;
      const valueA = data[propertyA];
      const valueB = data[propertyB];
      if (operatorCompare(operator, valueA, valueB)) {
        return result;
      }
    }
  }
  return "";
};

const resolveForShard = (forShard: ForShard, data: any): string => {
  const forSpecification = getMatch(extract.parenthesesContent, forShard.content);
  const forItemBody = getMatch(extract.bracesContent, forShard.content);
  const forSpecificationParts = forSpecification.split(" ");
  if (forSpecificationParts.length !== 3) {
    return "";
  }
  const [forItemVar, , forArrayVar] = forSpecificationParts;
  const array = data[forArrayVar];
  if (!array || !Array.isArray(array)) {
    return "";
  }
  let output = "";
  array.forEach((value, index) => {
    const identifier = `${forItemVar}${index}`;
    data[identifier] = value;
    output += forItemBody.replace(new RegExp(forItemVar, "g"), identifier);
  });
  return output;
};

const resolveInterpolationShard = (shard: InterpolationShard, data: any): string => {
  const accessor = shard.content.replace(allBrackets, "").replace(spaces, "");
  const value = data[accessor];
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return value.toString();
  }
  return "";
};

const resolveShard = (shard: Shard, data: any): string => {
  if (shard.type === "html") {
    return shard.content;
  }
  let output = "";
  let newShards: Shard[] = [];
  if (shard.type === "ifWrapper") {
    newShards = splitTemplate(resolveConditionalShard(shard, data));
  }
  if (shard.type === "for") {
    newShards = splitTemplate(resolveForShard(shard, data));
  }
  if (shard.type === "interpolation") {
    newShards = splitTemplate(resolveInterpolationShard(shard, data));
  }
  newShards.forEach((newShard) => {
    output += resolveShard(newShard, data);
  });
  return output;
};

const removeLineBreaks = (template: string) => {
  return template.replace(/[\r\n]/g, "");
};

const cleanSpacesBetweenTags = (str: string) => {
  return str.replace(/(?<=>)\s+(?=<)/g, "");
};

export const resolveRecursively = (template: string, data: any): string => {
  let output = "";
  const shards = splitTemplate(removeLineBreaks(template));
  shards.forEach((shard) => {
    output += resolveShard(shard, data);
  });
  return cleanSpacesBetweenTags(output);
};
