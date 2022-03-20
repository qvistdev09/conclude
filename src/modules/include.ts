import { TemplatesStore } from "./types";
import { getRegexMatch } from "./utils";

const includeBlocksRegex = /\[:#INCLUDE\s"[^\[\]]*":\]/g;
const extractIncludeKey = /(?<=").+(?=")/;

const createIncludeBlockRegex = (key: string): RegExp =>
  new RegExp('[\\[]:#INCLUDE\\s"' + key + '":[\\]]', 'g');

export const resolveTemplateIncludes = (
  template: string,
  templatesMap: TemplatesStore,
  history: string[] = []
): string => {
  const includeBlocks = (template.match(includeBlocksRegex) || []).filter(
    (value, index, array) => array.indexOf(value) === index
  );
  if (includeBlocks.length === 0) {
    return template;
  }
  const branchedHistory = [...history];
  let resolvedTemplate = template;
  includeBlocks.forEach((block) => {
    const templateKey = getRegexMatch(extractIncludeKey, block);
    if (templateKey) {
      const circularImport = branchedHistory.includes(templateKey);
      const replaceContent = circularImport ? "" : templatesMap[templateKey];
      if (!circularImport) {
        branchedHistory.push(templateKey);
      }
      console.log(createIncludeBlockRegex(templateKey))
      resolvedTemplate = resolvedTemplate.replace(
        createIncludeBlockRegex(templateKey),
        replaceContent
      );
    }
  });
  return resolveTemplateIncludes(resolvedTemplate, templatesMap, branchedHistory);
};
