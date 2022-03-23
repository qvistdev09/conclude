import {
  appendElseBlock,
  appendForBlock,
  appendHtmlBlock,
  appendIfBlock,
  appendInterpolationBlock,
} from "./block-creators";
import { resolveForBlock, resolveIfBlock, resolveInterpolationBlock } from "./block-resolvers";
import { resolveStoreIncludes } from "./include";
import { createStore } from "./store";
import { Blocks, TemplatesStore } from "./types";

const delimiters = /(\[:|:\])/g;
const leftDelimiter = /\[:/g;
const rightDelimiter = /:\]/g;

const blocksRegexes = {
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

const createAndAppendBlock = (input: string, blocks: Blocks.Any[]): void => {
  if (blocksRegexes.empty.test(input)) {
    return;
  }
  if (blocksRegexes.if.test(input)) {
    appendIfBlock(input, blocks);
    return;
  }
  if (blocksRegexes.elseIf.test(input)) {
    appendElseBlock(input, "elseIf", blocks);
    return;
  }
  if (blocksRegexes.else.test(input)) {
    appendElseBlock(input, "else", blocks);
    return;
  }
  if (blocksRegexes.for.test(input)) {
    appendForBlock(input, blocks);
    return;
  }
  if (blocksRegexes.interpolation.test(input)) {
    appendInterpolationBlock(input, blocks);
    return;
  }
  appendHtmlBlock(input, blocks);
};

const consolidateFragments = (
  fragmentedTemplate: string[],
  blocks: Blocks.Any[] = []
): Blocks.Any[] => {
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

const parseTemplateIntoBlocks = (template: string): Blocks.Any[] => {
  const fragmented = fragmentTemplate(template);
  return consolidateFragments(fragmented);
};

const resolveBlockSurfaceLayer = (
  block: Blocks.For | Blocks.Interpolation | Blocks.If,
  data: any
): string => {
  return block.type === "for"
    ? resolveForBlock(block, data)
    : block.type === "if"
    ? resolveIfBlock(block, data)
    : resolveInterpolationBlock(block, data);
};

const deepResolveBlock = (block: Blocks.Any, data: any): string => {
  if (block.type === "html") {
    return block.content;
  }
  const resolvedOuterLayer = resolveBlockSurfaceLayer(block, data);
  return parseTemplateIntoBlocks(resolvedOuterLayer).reduce(
    (output, currentBlock) => (output += deepResolveBlock(currentBlock, data)),
    ""
  );
};

const resolveRecursively = (template: string, data: any): string =>
  parseTemplateIntoBlocks(template).reduce(
    (output, block) => (output += deepResolveBlock(block, data)),
    ""
  );

export class ConcludeEngine {
  store: TemplatesStore;

  constructor(templatesFolder: string) {
    const importedStore = createStore(templatesFolder);
    this.store = resolveStoreIncludes(importedStore);
  }

  renderTemplate(templateName: string, data: any) {
    return resolveRecursively(this.store[templateName], data);
  }
}
