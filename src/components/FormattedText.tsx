import { Platform, StyleSheet, Text, View } from "react-native";
import { MonoFont, StudioColors } from "../constants/theme";

const PYTHON_KEYWORDS = new Set([
  "def",
  "return",
  "if",
  "elif",
  "else",
  "for",
  "while",
  "in",
  "not",
  "and",
  "or",
  "True",
  "False",
  "None",
  "import",
  "from",
  "class",
  "pass",
  "break",
  "continue",
  "lambda",
  "with",
  "as",
  "try",
  "except",
  "finally",
  "yield",
  "async",
  "await",
]);

const PYTHON_BUILTINS = new Set([
  "print",
  "len",
  "range",
  "enumerate",
  "int",
  "str",
  "list",
  "dict",
  "set",
  "tuple",
  "max",
  "min",
  "sum",
  "sorted",
  "abs",
  "round",
  "zip",
  "map",
  "filter",
  "append",
  "get",
  "items",
  "keys",
  "values",
  "pop",
  "add",
]);

const PYTHON_TOKEN_REGEX =
  /(#[^\n]*|f?"[^"\n]*"|f?'[^'\n]*'|\b(?:def|return|if|elif|else|for|while|in|not|and|or|True|False|None|import|from|class|pass|break|continue|lambda|with|as|try|except|finally|yield|async|await)\b|\b(?:print|len|range|enumerate|int|str|list|dict|set|tuple|max|min|sum|sorted|abs|round|zip|map|filter|append|get|items|keys|values|pop|add)\b|\b\d+(?:\.\d+)?\b|[=+\-*/%<>!:]+|[()[\]{},.])/g;

export function renderHighlightedPython(source: string) {
  if (!source) return null;
  const styles = getStyles();
  const tokens = source.split(PYTHON_TOKEN_REGEX);
  return tokens.map((tok, i) => {
    if (!tok) return null;
    if (tok.startsWith("#")) {
      return (
        <Text key={i} style={styles.synComment}>
          {tok}
        </Text>
      );
    }
    if (
      tok.startsWith('"') ||
      tok.startsWith("'") ||
      tok.startsWith('f"') ||
      tok.startsWith("f'")
    ) {
      return (
        <Text key={i} style={styles.synString}>
          {tok}
        </Text>
      );
    }
    if (PYTHON_KEYWORDS.has(tok)) {
      return (
        <Text key={i} style={styles.synKeyword}>
          {tok}
        </Text>
      );
    }
    if (PYTHON_BUILTINS.has(tok)) {
      return (
        <Text key={i} style={styles.synBuiltin}>
          {tok}
        </Text>
      );
    }
    if (/^\d/.test(tok)) {
      return (
        <Text key={i} style={styles.synNumber}>
          {tok}
        </Text>
      );
    }
    if (/^[=+\-*/%<>!:()[\]{},.]+$/.test(tok)) {
      return (
        <Text key={i} style={styles.synPunct}>
          {tok}
        </Text>
      );
    }
    return <Text key={i}>{tok}</Text>;
  });
}

function renderInlineSegments(text: string) {
  const styles = getStyles();
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <Text key={i} style={styles.inlineCode}>
          {part.slice(1, -1)}
        </Text>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <Text key={i} style={styles.boldInline}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return <Text key={i}>{part}</Text>;
  });
}

export default function FormattedText({
  text,
  style,
}: {
  text?: string;
  style?: any;
}) {
  if (!text) return null;
  const styles = getStyles();
  const normalized = text.replace(/\\n/g, "\n");
  const blocks = normalized.split(/(```[\s\S]*?```)/g);

  return (
    <View style={{ gap: 12, flex: 1, minWidth: 0, flexShrink: 1 }}>
      {blocks.map((block, bIdx) => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return null;

        if (trimmedBlock.startsWith("```") && trimmedBlock.endsWith("```")) {
          const rawCode = trimmedBlock
            .slice(3, -3)
            .replace(/^[a-zA-Z]+\n/, "")
            .trim();
          return (
            <View key={bIdx} style={styles.codeBlockContainer}>
              <View style={styles.codeBlockHeader}>
                <Text style={styles.codeBlockLang}>PYTHON</Text>
              </View>
              <Text style={styles.codeBlockText}>{rawCode}</Text>
            </View>
          );
        }

        const paragraphs = trimmedBlock.split("\n\n");
        return (
          <View key={bIdx} style={{ gap: 10, minWidth: 0, flexShrink: 1 }}>
            {paragraphs.map((para, pIdx) => {
              const lines = para.split("\n");
              const isBulletList =
                lines.length > 1 &&
                lines.every(
                  (l) =>
                    l.trim().startsWith("- ") || l.trim().startsWith("• "),
                );

              if (isBulletList) {
                return (
                  <View key={pIdx} style={{ gap: 6, minWidth: 0 }}>
                    {lines.map((line, lIdx) => {
                      const cleanLine = line
                        .trim()
                        .replace(/^[-•]\s+/, "");
                      return (
                        <View key={lIdx} style={styles.bulletRow}>
                          <Text style={styles.bulletDot}>•</Text>
                          <Text
                            style={[
                              style,
                              { flex: 1, minWidth: 0, flexShrink: 1 },
                            ]}
                          >
                            {renderInlineSegments(cleanLine)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                );
              }

              return (
                <Text
                  key={pIdx}
                  style={[style, { flexShrink: 1, minWidth: 0 }]}
                >
                  {renderInlineSegments(para)}
                </Text>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const getStyles = () =>
  StyleSheet.create({
  boldInline: { color: StudioColors.textPrimary, fontWeight: "900" },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingLeft: 4,
    width: "100%",
    minWidth: 0,
  },
  bulletDot: {
    color: StudioColors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "900",
  },
  codeBlockContainer: {
    backgroundColor: StudioColors.codeBg,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: StudioColors.border,
    overflow: "hidden",
  },
  codeBlockHeader: {
    backgroundColor: StudioColors.codeSurface,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: StudioColors.codeBorder,
  },
  codeBlockLang: {
    color: StudioColors.lime,
    fontSize: 9,
    fontWeight: "900",
    fontFamily: MonoFont,
    letterSpacing: 1,
  },
  codeBlockText: {
    color: StudioColors.codeText,
    fontFamily: MonoFont,
    fontSize: 13,
    lineHeight: 20,
    padding: 12,
    ...Platform.select({
      web: {
        whiteSpace: "pre-wrap" as any,
        wordBreak: "break-word" as any,
        overflowWrap: "anywhere" as any,
      },
    }),
  },
  inlineCode: {
    backgroundColor: StudioColors.surfaceElevated,
    color: StudioColors.textPrimary,
    fontFamily: MonoFont,
    fontSize: 12.5,
    fontWeight: "800",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    ...Platform.select({
      web: {
        whiteSpace: "pre-wrap" as any,
        wordBreak: "break-word" as any,
        overflowWrap: "anywhere" as any,
      },
    }),
  },
  synComment: {
    color: "#7A776E",
    fontStyle: "italic",
  },
  synString: {
    color: StudioColors.lime,
  },
  synKeyword: {
    color: StudioColors.pink,
    fontWeight: "700",
  },
  synBuiltin: {
    color: "#38BDF8",
  },
  synNumber: {
    color: StudioColors.yellow,
  },
  synPunct: {
    color: "#C7C2B6",
  },
});
