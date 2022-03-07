import FS from "fs";
import path from "path";

const htmlSplit = /((?<![{}]){{.*}}(?![{}]))/g;

const html = FS.readFileSync(path.resolve(__dirname, "../sample-html/index.html"), "utf-8");

const resolveTemplateShard = (shard: string): string => {
  let output = "";
  const splitShard = shard.split(htmlSplit).filter((str) => str !== "");
  if (splitShard.length === 1) {
    output += splitShard[0];
  } else {
    splitShard.forEach((subShard) => {
      output += resolveTemplateShard(subShard);
    });
  }
  return output;
};

console.log(resolveTemplateShard(html));
