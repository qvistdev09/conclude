import { Blocks } from "./types";
export declare const appendIfBlock: (input: string, blocks: Blocks.Any[]) => void;
export declare const appendElseBlock: (input: string, type: "else" | "elseIf", blocks: Blocks.Any[]) => void;
export declare const appendForBlock: (input: string, blocks: Blocks.Any[]) => void;
export declare const appendInterpolationBlock: (input: string, blocks: Blocks.Any[]) => void;
export declare const appendHtmlBlock: (input: string, blocks: Blocks.Any[]) => void;
