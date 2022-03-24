import { TemplatesStore } from "./types";
export declare class ConcludeEngine {
    store: TemplatesStore;
    constructor(templatesFolder: string);
    renderTemplate(templateName: string, data: any): string;
}
