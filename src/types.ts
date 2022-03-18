interface IfShard {
  type: "if";
  content: string;
}

interface ElseIfShard {
  type: "elseIf";
  content: string;
}

interface ElseShard {
  type: "else";
  content: string;
}

export interface ForShard {
  type: "for";
  content: string;
}

interface HtmlShard {
  type: "html";
  content: string;
}

export interface InterpolationShard {
  type: "interpolation";
  content: string;
}

interface EmptyShard {
  type: "empty";
}

export interface IfWrapper {
  type: "ifWrapper";
  parts: Array<IfShard | ElseIfShard | ElseShard>;
  chainClosed: boolean;
}

export type Shard =
  | IfShard
  | ElseIfShard
  | ElseShard
  | ForShard
  | HtmlShard
  | InterpolationShard
  | EmptyShard
  | IfWrapper;
