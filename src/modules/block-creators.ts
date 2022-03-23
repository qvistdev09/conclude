import { allBrackets, getRegexMatch, regexExtract, spaces } from "./utils";
import { resolveForBlock, resolveIfBlock, resolveInterpolationBlock } from "./block-resolvers";
import { Block } from "./types";

const createIfBlockConditional = (input: string): Block.If.Conditional | null => {
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

export const appendIfBlock = (input: string, blocks: Block.Wrapped[]): void => {
  const conditionObject = createIfBlockConditional(input);
  if (conditionObject) {
    const ifBlock: Block.If = {
      type: "if",
      chain: [
        {
          type: "if",
          condition: conditionObject,
        },
      ],
      chainClosed: false,
    };
    blocks.push({
      resolveAble: true,
      shard: ifBlock,
      resolve: (data: any) => resolveIfBlock(ifBlock, data),
    });
  }
};

export const appendElseBlock = (
  input: string,
  type: "else" | "elseIf",
  blocks: Block.Wrapped[]
): void => {
  const lastBlock = blocks.length > 0 ? blocks[blocks.length - 1] : null;
  if (lastBlock && lastBlock.shard.type === "if" && !lastBlock.shard.chainClosed) {
    if (type === "elseIf") {
      const conditionObject = createIfBlockConditional(input);
      if (conditionObject) {
        lastBlock.shard.chain.push({
          type: "elseIf",
          condition: conditionObject,
        });
        return;
      }
    }
    lastBlock.shard.chain.push({
      type: "else",
      result: getRegexMatch(regexExtract.bracesContent, input),
    });
    lastBlock.shard.chainClosed = true;
  }
};

export const appendForBlock = (input: string, blocks: Block.Wrapped[]): void => {
  const [itemName, , arrayName] = getRegexMatch(regexExtract.parenthesesContent, input).split(" ");
  const forBody = getRegexMatch(regexExtract.bracesContent, input);
  const forBlock: Block.For = {
    type: "for",
    itemName,
    arrayName,
    forBody,
  };
  blocks.push({
    resolveAble: true,
    shard: forBlock,
    resolve: (data: any) => resolveForBlock(forBlock, data),
  });
};

export const appendInterpolationBlock = (input: string, blocks: Block.Wrapped[]): void => {
  const variableName = input.replace(allBrackets, "").replace(spaces, "");
  const interpolationBlock: Block.Interpolation = {
    type: "interpolation",
    variableName,
  };

  blocks.push({
    resolveAble: true,
    shard: interpolationBlock,
    resolve: (data: any) => resolveInterpolationBlock(interpolationBlock, data),
  });
};

export const appendHtmlBlock = (input: string, blocks: Block.Wrapped[]): void => {
  blocks.push({
    resolveAble: false,
    shard: {
      type: "html",
      content: input,
    },
  });
};
