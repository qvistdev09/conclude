import { Shard } from "./types";

const appendIfShard = (str: string, shards: Shard[]): void => {
  shards.push({
    type: "if",
    chain: [
      {
        type: "if",
        content: str,
      },
    ],
    chainClosed: false,
  });
};

const appendElseShard = (str: string, type: "else" | "elseIf", shards: Shard[]): void => {
  const lastShard = shards.length > 0 ? shards[shards.length - 1] : null;
  if (lastShard && lastShard.type === "if" && !lastShard.chainClosed) {
    lastShard.chain.push({
      type,
      content: str,
    });
    if (type === "else") {
      lastShard.chainClosed = true;
    }
  }
};

const appendForShard = (str: string, shards: Shard[]): void => {
  shards.push({
    type: "for",
    content: str,
  });
};

const appendInterpolationShard = (str: string, shards: Shard[]): void => {
  shards.push({
    type: "interpolation",
    content: str,
  });
};

const appendHtmlShard = (str: string, shards: Shard[]): void => {
  shards.push({
    type: "html",
    content: str,
  });
};

export default {
  appendIfShard,
  appendElseShard,
  appendForShard,
  appendInterpolationShard,
  appendHtmlShard,
};
