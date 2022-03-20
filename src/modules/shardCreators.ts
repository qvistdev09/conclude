import { allBrackets, getRegexMatch, regexExtract, spaces } from "./utils";
import shardResolvers from "./shardResolvers";
import {
  ComparisonConditional,
  ForShard,
  IfShard,
  InterpolationShard,
  TruthinessConditional,
  WrappedShard,
} from "./types";

const createIfShardConditionObject = (
  input: string
): TruthinessConditional | ComparisonConditional | null => {
  const conditionElements = getRegexMatch(regexExtract.parenthesesContent, input).split(" ");
  const result = getRegexMatch(regexExtract.bracesContent, input);
  if (
    conditionElements.length === 1 &&
    conditionElements[0].length > 1 &&
    conditionElements[0][0] === "!"
  ) {
    const variableName = conditionElements[0].slice(1);
    return {
      type: "truthinessCheck",
      inverted: true,
      variableName,
      result,
    };
  }
  if (conditionElements.length === 1) {
    const variableName = conditionElements[0];
    return {
      type: "truthinessCheck",
      inverted: false,
      variableName,
      result,
    };
  }
  if (conditionElements.length === 3) {
    const [leftHandVariable, operator, rightHandVariable] = conditionElements;
    return {
      type: "comparison",
      leftHandVariable,
      rightHandVariable,
      operator,
      result,
    };
  }
  return null;
};

const appendIfShard = (str: string, shards: WrappedShard[]): void => {
  const conditionObject = createIfShardConditionObject(str);
  if (conditionObject) {
    const ifShard: IfShard = {
      type: "if",
      chain: [
        {
          type: "if",
          condition: conditionObject,
        },
      ],
      chainClosed: false,
    };
    shards.push({
      resolveAble: true,
      shard: ifShard,
      resolve: (data: any) => shardResolvers.resolveIfShard(ifShard, data),
    });
  }
};

const appendElseShard = (str: string, type: "else" | "elseIf", shards: WrappedShard[]): void => {
  const lastShard = shards.length > 0 ? shards[shards.length - 1] : null;
  if (lastShard && lastShard.shard.type === "if" && !lastShard.shard.chainClosed) {
    if (type === "elseIf") {
      const conditionObject = createIfShardConditionObject(str);
      if (conditionObject) {
        lastShard.shard.chain.push({
          type: "elseIf",
          condition: conditionObject,
        });
        return;
      }
    }
    lastShard.shard.chain.push({
      type: "else",
      result: getRegexMatch(regexExtract.bracesContent, str),
    });
    lastShard.shard.chainClosed = true;
  }
};

const appendForShard = (str: string, shards: WrappedShard[]): void => {
  const [itemName, , arrayName] = getRegexMatch(regexExtract.parenthesesContent, str).split(" ");
  const forBody = getRegexMatch(regexExtract.bracesContent, str);
  const forShard: ForShard = {
    type: "for",
    itemName,
    arrayName,
    forBody,
  };
  shards.push({
    resolveAble: true,
    shard: forShard,
    resolve: (data: any) => shardResolvers.resolveForShard(forShard, data),
  });
};

const appendInterpolationShard = (str: string, shards: WrappedShard[]): void => {
  const variableName = str.replace(allBrackets, "").replace(spaces, "");
  const interpolationShard: InterpolationShard = {
    type: "interpolation",
    variableName,
  };

  shards.push({
    resolveAble: true,
    shard: interpolationShard,
    resolve: (data: any) => shardResolvers.resolveInterpolationShard(interpolationShard, data),
  });
};

const appendHtmlShard = (str: string, shards: WrappedShard[]): void => {
  shards.push({
    resolveAble: false,
    shard: {
      type: "html",
      content: str,
    },
  });
};

export default {
  appendIfShard,
  appendElseShard,
  appendForShard,
  appendInterpolationShard,
  appendHtmlShard,
};
