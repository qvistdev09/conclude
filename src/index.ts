import FS from "fs";
import path from "path";

const htmlSplit = /({{[^{}]*}})/g;
const dataInterpolation = /^{{.+}}$/;
const allBrackets = /[{}]/g;
const spaces = /\s/g;

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

const resolveFloorLevelShard = (shard: string, data: any): string => {
  if (dataInterpolation.test(shard)) {
    return interpolateShardData(shard, data);
  }
  return shard;
};

const conditionalShard = /^\[:#IF\s+\(.+\)\s+THEN\s+{(.|[\n\s\r])+}:\]$/;
const matchCondition = /(?<=\().+(?=\))/;
const matchResult = /(?<={)(.|[\n\s\r])+(?=})/;

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
  const condition = getMatch(matchCondition, shard);
  const result = getMatch(matchResult, shard);
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

const resolveTemplate = (template: string, data: any): string => {
  const shards = consolidateShards(fragmentTemplate(template));
  const resolvedConditionals = shards.map((shard) => resolveConditional(shard, data));
  return resolvedConditionals.join("");
};

const data = {
  showName: true,
  showHobby: true,
  age: 25,
  limit: 25,
};
const resolvedTemplate = resolveTemplate(html.replace(/[\r\n]/g, ""), data);

FS.writeFileSync("resolvedTemplate.html", resolvedTemplate);


