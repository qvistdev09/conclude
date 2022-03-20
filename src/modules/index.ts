import shardCreators from "./shardCreators";
import { WrappedShard } from "./types";

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

const createAndAppendShard = (input: string, shardArray: WrappedShard[]): void => {
  if (shards.empty.test(input)) {
    return;
  }
  if (shards.if.test(input)) {
    shardCreators.appendIfShard(input, shardArray);
    return;
  }
  if (shards.elseIf.test(input)) {
    shardCreators.appendElseShard(input, "elseIf", shardArray);
    return;
  }
  if (shards.else.test(input)) {
    shardCreators.appendElseShard(input, "else", shardArray);
    return;
  }
  if (shards.for.test(input)) {
    shardCreators.appendForShard(input, shardArray);
    return;
  }
  if (shards.interpolation.test(input)) {
    shardCreators.appendInterpolationShard(input, shardArray);
    return;
  }
  shardCreators.appendHtmlShard(input, shardArray);
};

const consolidateShards = (
  fragmentedTemplate: string[],
  consolidated: WrappedShard[] = []
): WrappedShard[] => {
  if (fragmentedTemplate.length === 0) {
    return consolidated;
  }
  const [fragment] = fragmentedTemplate;
  if (fragmentedTemplate.length === 1) {
    createAndAppendShard(fragment, consolidated);
    return consolidated;
  }
  if (balancedDelimiters(fragment)) {
    createAndAppendShard(fragment, consolidated);
    return consolidateShards(fragmentedTemplate.slice(1), consolidated);
  }
  if (!leftDelimiter.test(fragment) && !rightDelimiter.test(fragment)) {
    shardCreators.appendHtmlShard(fragment, consolidated);
    return consolidateShards(fragmentedTemplate.slice(1), consolidated);
  }
  const joinedFragments = `${fragmentedTemplate[0]}${fragmentedTemplate[1]}`;
  return consolidateShards([joinedFragments, ...fragmentedTemplate.slice(2)], consolidated);
};

const splitTemplate = (template: string): WrappedShard[] => {
  const fragmented = fragmentTemplate(template);
  return consolidateShards(fragmented);
};

const resolveShard = (wrappedShard: WrappedShard, data: any): string => {
  if (!wrappedShard.resolveAble) {
    return wrappedShard.shard.content;
  }
  const resolvedShard = wrappedShard.resolve(data);
  return splitTemplate(resolvedShard).reduce(
    (output, currentShard) => (output += resolveShard(currentShard, data)),
    ""
  );
};

const removeLineBreaks = (template: string) => {
  return template.replace(/[\r\n]/g, "");
};

const cleanSpacesBetweenTags = (str: string) => {
  return str.replace(/(?<=>)\s+(?=<)/g, "");
};

export const resolveRecursively = (template: string, data: any): string => {
  let output = "";
  const shards = splitTemplate(removeLineBreaks(template));
  shards.forEach((shard) => {
    output += resolveShard(shard, data);
  });
  return cleanSpacesBetweenTags(output);
};
