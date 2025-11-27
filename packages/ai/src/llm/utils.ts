import type { BaseMessage } from "@langchain/core/messages";

export function extractContent(response: BaseMessage): string {
  if (typeof response.content === "string") {
    return response.content;
  }

  if (Array.isArray(response.content)) {
    return response.content
      .map((part) =>
        typeof part === "string"
          ? part
          : "text" in part && typeof part.text === "string"
            ? part.text
            : "",
      )
      .join("");
  }

  return "";
}
