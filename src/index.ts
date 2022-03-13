import FS from "fs";
import path from "path";

const allBrackets = /\[:|:\]/g;
const delimiters = /(\[:|:\])/g;
const leftDelimiter = /\[:/g;
const rightDelimiter = /:\]/g;

const html = FS.readFileSync(path.resolve(__dirname, "../sample-html/index.html"), "utf-8");

const fragmentTemplate = (template: string) => {
  return template.split(delimiters).filter((str) => str !== "");
};

const balancedDelimiters = (str: string) => {
  return str.match(leftDelimiter)?.length === str.match(rightDelimiter)?.length;
};

const consolidateShards = (fragmentedTemplate: string[], consolidated: string[] = []): string[] => {
  const [fragment] = fragmentedTemplate;
  if (fragmentedTemplate.length === 1) {
    consolidated.push(fragment);
    return consolidated;
  }
  if (!leftDelimiter.test(fragment) && !rightDelimiter.test(fragment)) {
    consolidated.push(fragment);
    return consolidateShards(fragmentedTemplate.slice(1), consolidated);
  }
  if (balancedDelimiters(fragment)) {
    consolidated.push(fragment);
    return consolidateShards(fragmentedTemplate.slice(1), consolidated);
  }
  const joinedFragments = `${fragmentedTemplate[0]}${fragmentedTemplate[1]}`;
  return consolidateShards([joinedFragments, ...fragmentedTemplate.slice(2)], consolidated);
};

const splitTemplate = (template: string) => {
  const fragmented = fragmentTemplate(template);
  return consolidateShards(fragmented);
};

const spaces = /\s/g;

const interpolateShardData = (shard: string, data: any): string => {
  const accessor = shard.replace(allBrackets, "").replace(spaces, "");
  const value = data[accessor];
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return value.toString();
  }
  return "";
};

const dataInterpolation = /^\[:.+:\]$/;

const resolveFloorLevelShard = (shard: string, data: any): string => {
  if (dataInterpolation.test(shard)) {
    return interpolateShardData(shard, data);
  }
  return shard;
};

const conditionalShard = /^\[:#IF\s+\(.+\)\s+THEN\s+{(.|[\n\s\r])+}:\]$/;
const parenthesesContent = /(?<=\()[^\(\)]+(?=\))/;
const bracesContent = /(?<={)(.|[\n\s\r])+(?=}(?!}))/;

const getMatch = (regex: RegExp, str: string) => {
  const result = str.match(regex);
  if (result) {
    return result[0];
  }
  return "";
};

const resolveConditional = (shard: string, data: any) => {
  if (!conditionalShard.test(shard)) {
    return shard;
  }
  const condition = getMatch(parenthesesContent, shard);
  const result = getMatch(bracesContent, shard);
  const conditionParts = condition.split(" ");
  if (conditionParts.length === 1) {
    return !!data[condition] ? result : "";
  }
  if (conditionParts.length === 3) {
    const [propertyA, operator, propertyB] = conditionParts;
    const valueA = data[propertyA];
    const valueB = data[propertyB];
    switch (operator) {
      case "<":
        return valueA < valueB ? result : "";
      case ">":
        return valueA > valueB ? result : "";
      case "<=":
        return valueA <= valueB ? result : "";
      case ">=":
        return valueA >= valueB ? result : "";
      case "=":
        return valueA === valueB ? result : "";
      case "!=":
        return valueA !== valueB ? result : "";
      default:
        return "";
    }
  }
  return "";
};

const removeLineBreaks = (template: string) => {
  return template.replace(/[\r\n]/g, "");
};

const forBlock = /^\[:#FOR\s\(.+\sIN\s.+\)\s{.+}:\]/;

const resolveForBlock = (shard: string, data: any) => {
  if (!forBlock.test(shard)) {
    return shard;
  }
  const forSpecification = getMatch(parenthesesContent, shard);
  const forItemBody = getMatch(bracesContent, shard);
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

const resolveRecursively = (template: string, data: any) => {
  let output = "";
  const splitShard = splitTemplate(template)
    .map((shard) => resolveConditional(shard, data))
    .map((shard) => resolveForBlock(shard, data))
    .filter((str) => str !== "");
  if (splitShard.length === 1) {
    output += resolveFloorLevelShard(splitShard[0], data);
  } else {
    splitShard.forEach((subShard) => {
      output += resolveRecursively(subShard, data);
    });
  }
  return output;
};

const cleanSpacesBetweenTags = (str: string) => {
  return str.replace(/(?<=>)\s+(?=<)/g, "");
};

const resolveTemplate = (template: string, data: any): string => {
  const cleanedFromLineBreaks = removeLineBreaks(template);
  return cleanSpacesBetweenTags(resolveRecursively(cleanedFromLineBreaks, data));
};

const data = {
  books: ["Harry Potter", "Hunger Games", "Lord of the ring"],
};

FS.writeFileSync("resolvedTemplate.html", resolveTemplate(html, data));
