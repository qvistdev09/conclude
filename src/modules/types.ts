export interface TruthinessConditional {
  type: "truthinessCheck";
  inverted: boolean;
  variableName: string;
  result: string;
}

export interface ComparisonConditional {
  type: "comparison";
  leftHandVariable: string;
  rightHandVariable: string;
  operator: string;
  result: string;
}

export type IfShardChainElement =
  | {
      type: "if" | "elseIf";
      condition: TruthinessConditional | ComparisonConditional;
    }
  | {
      type: "else";
      result: string;
    };

export interface IfShard {
  type: "if";
  chain: IfShardChainElement[];
  chainClosed: boolean;
}

export interface ForShard {
  type: "for";
  itemName: string;
  arrayName: string;
  forBody: string;
}

export interface InterpolationShard {
  type: "interpolation";
  variableName: string;
}

export interface HtmlShard {
  type: "html";
  content: string;
}

export type WrappedShard =
  | {
      resolveAble: true;
      shard: IfShard | ForShard | InterpolationShard;
      resolve: (data: any) => string;
    }
  | {
      resolveAble: false;
      shard: HtmlShard;
    };

export interface TemplatesStore {
  [key: string]: string;
}
