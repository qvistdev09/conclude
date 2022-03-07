import FS from "fs";
import path from "path";

const htmlSplit = /((?<![{}]){{.*}}(?![{}]))/g;
const dataInterpolation = /^{{.+}}$/;
const allBrackets = /[{}]/g;
const spaces = /\s/g;

const html = FS.readFileSync(path.resolve(__dirname, "../sample-html/index.html"), "utf-8");

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

const resolveTemplateShard = (shard: string, data: any): string => {
  let output = "";
  const splitShard = shard.split(htmlSplit).filter((str) => str !== "");
  console.log(splitShard)
  if (splitShard.length === 1) {
    output += resolveFloorLevelShard(splitShard[0], data);
  } else {
    splitShard.forEach((subShard) => {
      output += resolveTemplateShard(subShard, data);
    });
  }
  return output;
};

console.log(resolveTemplateShard(html, { name: "Oscar" }));
