export namespace Blocks {
  export interface If {
    type: "if";
    chain: If.ChainElement[];
    chainClosed: boolean;
  }
  export namespace If {
    export type Conditional =
      | {
          type: "truthinessCheck";
          inverted: boolean;
          variableName: string;
          result: string;
        }
      | {
          type: "comparison";
          leftHandVariable: string;
          rightHandVariable: string;
          operator: string;
          result: string;
        };

    export type ChainElement =
      | {
          type: "if" | "elseIf";
          condition: Conditional;
        }
      | {
          type: "else";
          result: string;
        };
  }
  export interface For {
    type: "for";
    itemName: string;
    arrayName: string;
    forBody: string;
  }

  export interface Interpolation {
    type: "interpolation";
    variableName: string;
  }

  export interface Html {
    type: "html";
    content: string;
  }

  export type Wrapped =
    | {
        resolveAble: true;
        shard: If | For | Interpolation;
        resolve: (data: any) => string;
      }
    | {
        resolveAble: false;
        shard: Html;
      };
}

export interface TemplatesStore {
  [key: string]: string;
}
