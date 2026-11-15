import type { LessonEnrichment } from "../constants/curriculum";

export interface OrganizedLearnView {
  explanationText: string;
  singleExampleCode: string;
  cheatSheetCode: string;
  realWorldUse: string;
}

const FENCED_CODE_REGEX = /```(?:python)?\s*\n?([\s\S]*?)```/g;

/**
 * Separates prose explanation from fenced code so Full Guide renders a
 * clear explanation paired with a single non-redundant worked example.
 */
export function buildOrganizedLearnView(
  content?: string,
  enrichment?: LessonEnrichment | null,
): OrganizedLearnView {
  const normalized = (content || "").replace(/\\n/g, "\n").trim();
  const inlineBlocks: string[] = [];

  let hadTrailingCodeBlock = false;
  const trimmedEnd = normalized.trimEnd();
  if (/```[\s\S]*```$/.test(trimmedEnd)) {
    hadTrailingCodeBlock = true;
  }

  let explanationText = normalized
    .replace(FENCED_CODE_REGEX, (_, codeBody: string) => {
      const cleaned = codeBody.trim();
      if (cleaned) {
        inlineBlocks.push(cleaned);
      }
      return "";
    })
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (hadTrailingCodeBlock && explanationText.endsWith(":")) {
    explanationText = `${explanationText.slice(0, -1)}.`;
  }

  const cheatSheetCode = (enrichment?.cheatSheet || "")
    .replace(/\\n/g, "\n")
    .trim();
  const singleExampleCode = inlineBlocks[0] || cheatSheetCode;

  return {
    explanationText,
    singleExampleCode,
    cheatSheetCode: cheatSheetCode || singleExampleCode,
    realWorldUse: (enrichment?.realWorldUse || "").trim(),
  };
}
