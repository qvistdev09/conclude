import { ConcludeEngine } from "./modules/main";

const createEngine = (templatesFolderPath: string) => new ConcludeEngine(templatesFolderPath);

export { createEngine };
