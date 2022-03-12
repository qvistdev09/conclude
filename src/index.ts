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

const fragmentedTemplate = fragmentTemplate(html);

console.log("!!!");
console.log(consolidateShards(fragmentedTemplate));

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

const resolveTemplate = (template: string, data: any): string => {
  let output = "";
  const splitShard = template.split(htmlSplit).filter((str) => str !== "");
  if (splitShard.length === 1) {
    output += resolveFloorLevelShard(splitShard[0], data);
  } else {
    splitShard.forEach((subShard) => {
      output += resolveTemplate(subShard, data);
    });
  }
  return output;
};
