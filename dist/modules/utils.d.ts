export declare const spaces: RegExp;
export declare const allBrackets: RegExp;
export declare const regexExtract: {
    parenthesesContent: RegExp;
    bracesContent: RegExp;
};
export declare const getRegexMatch: (regExp: RegExp, input: string) => string;
export declare const getDeepvalue: (data: any, path: string, defaultValue?: null) => any;
