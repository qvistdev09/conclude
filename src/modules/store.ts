import FS from "fs";
import clean from "./clean";
import { TemplatesStore } from "./types";
import { getRegexMatch } from "./utils";

const fileKey = /(?<=\/)[^\/]+\.[^\/]+$/;

const getFilePaths = (basePath: string, pathsArray: Array<string> = []) => {
  const directoryContents = FS.readdirSync(basePath);
  directoryContents.forEach((content) => {
    const combinedPath = `${basePath}/${content}`;
    if (FS.statSync(combinedPath).isDirectory()) {
      getFilePaths(combinedPath, pathsArray);
    } else {
      pathsArray.push(combinedPath);
    }
  });
  return pathsArray;
};

export const createStore = (basePath: string): TemplatesStore => {
  const filePaths = getFilePaths(basePath);
  return filePaths.reduce((map: TemplatesStore, path) => {
    const template = FS.readFileSync(path, "utf-8");
    const key = getRegexMatch(fileKey, path);
    if (key) {
      map[key] = clean.cleanOutput(template);
    }
    return map;
  }, {});
};
