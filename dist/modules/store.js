"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStore = void 0;
const fs_1 = __importDefault(require("fs"));
const clean_1 = __importDefault(require("./clean"));
const utils_1 = require("./utils");
const fileKey = /(?<=\/)[^\/]+\.[^\/]+$/;
const getFilePaths = (basePath, pathsArray = []) => {
    const directoryContents = fs_1.default.readdirSync(basePath);
    directoryContents.forEach((content) => {
        const combinedPath = `${basePath}/${content}`;
        if (fs_1.default.statSync(combinedPath).isDirectory()) {
            getFilePaths(combinedPath, pathsArray);
        }
        else {
            pathsArray.push(combinedPath);
        }
    });
    return pathsArray;
};
const createStore = (basePath) => {
    const filePaths = getFilePaths(basePath);
    return filePaths.reduce((map, path) => {
        const template = fs_1.default.readFileSync(path, "utf-8");
        const key = (0, utils_1.getRegexMatch)(fileKey, path);
        if (key) {
            map[key] = clean_1.default.cleanOutput(template);
        }
        return map;
    }, {});
};
exports.createStore = createStore;
