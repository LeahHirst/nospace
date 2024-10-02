import type { Monaco } from "./types";
import type monaco from "monaco-editor";

export function registerLanguage(
  monaco: Monaco,
  id: string,
  keywords: string[],
  tokenizer: monaco.languages.IMonarchLanguage["tokenizer"],
) {
  if (!monaco) {
    return;
  }

  monaco.languages.register({ id });
  monaco.languages.setMonarchTokensProvider(id, { keywords, tokenizer });
  monaco.languages.registerCompletionItemProvider(id, {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      return {
        suggestions: keywords.map((keyword) => ({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: keyword,
          range: new monaco.Range(
            position.lineNumber,
            word.startColumn,
            position.lineNumber,
            word.endColumn,
          ),
        })),
      };
    },
  });
}
