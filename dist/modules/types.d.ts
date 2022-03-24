export declare namespace Blocks {
    interface If {
        type: "if";
        chain: If.ChainElement[];
        chainClosed: boolean;
    }
    namespace If {
        type Conditional = {
            type: "truthinessCheck";
            inverted: boolean;
            variableName: string;
            result: string;
        } | {
            type: "comparison";
            leftHandVariable: string;
            rightHandVariable: string;
            operator: string;
            result: string;
        };
        type ChainElement = {
            type: "if" | "elseIf";
            condition: Conditional;
        } | {
            type: "else";
            result: string;
        };
    }
    interface For {
        type: "for";
        itemName: string;
        arrayName: string;
        forBody: string;
    }
    interface Interpolation {
        type: "interpolation";
        variableName: string;
    }
    interface Html {
        type: "html";
        content: string;
    }
    type Any = If | For | Interpolation | Html;
}
export interface TemplatesStore {
    [key: string]: string;
}
