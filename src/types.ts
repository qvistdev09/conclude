interface IfShard {
  type: "if";
  parts: string[];
}

interface ElseIfShard {
  type: "elseIf";
  content: string;
}

interface ElseShard {
  type: "else";
  content: string;
}

interface ForShard {
  type: "for";
  content: string;
}

interface HtmlShard {
  type: "html";
  content: string;
}

interface InterpolationShard {
  type: "interpolation";
  content: string;
}

export type Shard = IfShard | ElseIfShard | ElseShard | ForShard | HtmlShard | InterpolationShard;
