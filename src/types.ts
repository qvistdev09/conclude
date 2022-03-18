interface IfShard {
  type: "if";
  parts: string[];
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

export type Shard = IfShard | ForShard | HtmlShard | InterpolationShard;
