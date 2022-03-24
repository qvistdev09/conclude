import { Blocks } from "./types";
export declare const resolveIfBlock: (ifBlock: Blocks.If, data: any) => string;
export declare const resolveForBlock: (forBlock: Blocks.For, data: any) => string;
export declare const resolveInterpolationBlock: (interpolationBlock: Blocks.Interpolation, data: any) => string;
