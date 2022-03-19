export interface IfShardChainElement {
  type: "if" | "else" | "elseIf";
  content: string;
}

export interface IfShard {
  type: "if";
  chain: IfShardChainElement[];
  chainClosed: boolean;
}

export interface ForShard {
  type: "for";
  content: string;
}

export interface HtmlShard {
  type: "html";
  content: string;
}

export interface InterpolationShard {
  type: "interpolation";
  content: string;
}

export type Shard = IfShard | ForShard | HtmlShard | InterpolationShard;
