import { allBrackets, getRegexMatch, regexExtract, spaces } from "./utils";
import { Blocks } from "./types";

const createIfBlockConditional = (input: string): Blocks.If.Conditional | null => {
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

export const appendIfBlock = (input: string, blocks: Blocks.Any[]): void => {
  const conditionObject = createIfBlockConditional(input);
  if (conditionObject) {
    blocks.push({
      type: "if",
      chain: [
        {
          type: "if",
          condition: conditionObject,
        },
      ],
      chainClosed: false,
    });
  }
};

export const appendElseBlock = (
  input: string,
  type: "else" | "elseIf",
  blocks: Blocks.Any[]
): void => {
  const lastBlock = blocks.length > 0 ? blocks[blocks.length - 1] : null;
  if (lastBlock && lastBlock.type === "if" && !lastBlock.chainClosed) {
    if (type === "elseIf") {
      const conditionObject = createIfBlockConditional(input);
      if (conditionObject) {
        lastBlock.chain.push({
          type: "elseIf",
          condition: conditionObject,
        });
        return;
      }
    }
    lastBlock.chain.push({
      type: "else",
      result: getRegexMatch(regexExtract.bracesContent, input),
    });
    lastBlock.chainClosed = true;
  }
};

export const appendForBlock = (input: string, blocks: Blocks.Any[]): void => {
  const [itemName, , arrayName] = getRegexMatch(regexExtract.parenthesesContent, input).split(" ");
  const forBody = getRegexMatch(regexExtract.bracesContent, input);
  blocks.push({
    type: "for",
    itemName,
    arrayName,
    forBody,
  });
};

export const appendInterpolationBlock = (input: string, blocks: Blocks.Any[]): void => {
  const variableName = input.replace(allBrackets, "").replace(spaces, "");
  blocks.push({
    type: "interpolation",
    variableName,
  });
};

export const appendHtmlBlock = (input: string, blocks: Blocks.Any[]): void => {
  blocks.push({
    type: "html",
    content: input,
  });
};
