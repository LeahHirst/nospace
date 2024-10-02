import { Instruction } from "@repo/parser";
import { registerLanguage } from "./common";
import type { Monaco } from "./types";

export function registerWhitespace(monaco: Monaco) {
  const keywords = Object.values(Instruction)
    .filter((x) => ![Instruction.Cast, Instruction.Assert].includes(x))
    .map((x) => x.replace(/s/g, " ").replace(/t/g, "\t").replace(/n/g, "\n"));
  registerLanguage(monaco, "whitespace", keywords, {
    root: [
      [
        /@?[a-zA-Z][\w$]*/,
        {
          cases: {
            "@keywords": "keyword",
            "@default": "variable",
          },
        },
      ],
      [/[ \t]*?\n/, "string"],
      [/#/, "comment"],
    ],
  });
}
