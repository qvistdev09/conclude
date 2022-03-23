import {
  appendElseBlock,
  appendForBlock,
  appendHtmlBlock,
  appendIfBlock,
  appendInterpolationBlock,
} from "./block-creators";
import { Block } from "./types";

const delimiters = /(\[:|:\])/g;
const leftDelimiter = /\[:/g;
const rightDelimiter = /:\]/g;

const shards = {
  if: /^\[:#IF\s+\(.+\)\s+THEN\s+{(.|[\n\s\r])+}:\]$/,
  elseIf: /^\[:#ELSE_IF\s+\(.+\)\s+THEN\s+{(.|[\n\s\r])+}:\]$/,
  else: /^\[:#ELSE\s+{(.|[\n\s\r])+}:\]$/,
  for: /^\[:#FOR\s\(.+\sIN\s.+\)\s{(.|[\n\s\r])+}:\]$/,
  interpolation: /^\[:(?!.*\[:).+(?<!:\].*):\]$/,
  empty: /^\s*$/,
};

const fragmentTemplate = (template: string) => {
  return template.split(delimiters).filter((str) => str !== "");
};

const balancedDelimiters = (str: string) => {
  return str.match(leftDelimiter)?.length === str.match(rightDelimiter)?.length;
};

const createAndAppendBlock = (input: string, blocks: Block.Wrapped[]): void => {
  if (shards.empty.test(input)) {
    return;
  }
  if (shards.if.test(input)) {
    appendIfBlock(input, blocks);
    return;
  }
  if (shards.elseIf.test(input)) {
    appendElseBlock(input, "elseIf", blocks);
    return;
  }
  if (shards.else.test(input)) {
    appendElseBlock(input, "else", blocks);
    return;
  }
  if (shards.for.test(input)) {
    appendForBlock(input, blocks);
    return;
  }
  if (shards.interpolation.test(input)) {
    appendInterpolationBlock(input, blocks);
    return;
  }
  appendHtmlBlock(input, blocks);
};

const consolidateFragments = (
  fragmentedTemplate: string[],
  blocks: Block.Wrapped[] = []
): Block.Wrapped[] => {
  if (fragmentedTemplate.length === 0) {
    return blocks;
  }
  const [fragment] = fragmentedTemplate;
  if (fragmentedTemplate.length === 1) {
    createAndAppendBlock(fragment, blocks);
    return blocks;
  }
  if (balancedDelimiters(fragment)) {
    createAndAppendBlock(fragment, blocks);
    return consolidateFragments(fragmentedTemplate.slice(1), blocks);
  }
  if (!leftDelimiter.test(fragment) && !rightDelimiter.test(fragment)) {
    appendHtmlBlock(fragment, blocks);
    return consolidateFragments(fragmentedTemplate.slice(1), blocks);
  }
  const joinedFragments = `${fragmentedTemplate[0]}${fragmentedTemplate[1]}`;
  return consolidateFragments([joinedFragments, ...fragmentedTemplate.slice(2)], blocks);
};

const parseTemplate = (template: string): Block.Wrapped[] => {
  const fragmented = fragmentTemplate(template);
  return consolidateFragments(fragmented);
};

const resolveBlock = (block: Block.Wrapped, data: any): string => {
  if (!block.resolveAble) {
    return block.shard.content;
  }
  const resolvedShard = block.resolve(data);
  return parseTemplate(resolvedShard).reduce(
    (output, currentBlock) => (output += resolveBlock(currentBlock, data)),
    ""
  );
};

export const resolveRecursively = (template: string, data: any): string =>
  parseTemplate(template).reduce((output, block) => (output += resolveBlock(block, data)), "");
