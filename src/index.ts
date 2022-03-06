import FS from "fs";
import path from "path";

const htmlSplit = /((?<![{}]){{.*}}(?![{}]))/g;

const html = FS.readFileSync(path.resolve(__dirname, "../sample-html/index.html"), "utf-8");

console.log(html.split(htmlSplit));
