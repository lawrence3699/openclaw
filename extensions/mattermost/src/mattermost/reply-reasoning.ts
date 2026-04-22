import {
  normalizeLowercaseStringOrEmpty,
  stripInlineDirectiveTagsForDelivery,
  stripReasoningTagsFromText,
} from "openclaw/plugin-sdk/text-runtime";
import type { ReplyPayload } from "./runtime-api.js";

const REASONING_PREFIX = "reasoning:";

export function shouldSuppressMattermostReasoningReply(
  payload: Pick<ReplyPayload, "text" | "isReasoning">,
): boolean {
  if (payload.isReasoning === true) {
    return true;
  }
  const text = payload.text;
  if (typeof text !== "string") {
    return false;
  }
  const trimmedStart = text.trimStart();
  if (!trimmedStart) {
    return false;
  }
  if (normalizeLowercaseStringOrEmpty(trimmedStart).startsWith(REASONING_PREFIX)) {
    return true;
  }
  const strippedReasoning = stripReasoningTagsFromText(text, { mode: "strict", trim: "both" });
  return strippedReasoning !== text && !strippedReasoning.trim();
}

export function sanitizeMattermostDraftPreviewText(text?: string): string | undefined {
  if (typeof text !== "string") {
    return undefined;
  }
  const cleaned = stripInlineDirectiveTagsForDelivery(
    stripReasoningTagsFromText(text, { mode: "strict", trim: "both" }),
  ).text.trim();
  if (!cleaned) {
    return undefined;
  }
  if (shouldSuppressMattermostReasoningReply({ text: cleaned })) {
    return undefined;
  }
  return cleaned;
}
