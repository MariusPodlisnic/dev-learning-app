import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");

export const ROOT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

const moduleCache = new Map();

function resolveLocalFile(baseDir, specifier) {
  const mapped = specifier.startsWith("@/")
    ? path.join(ROOT_DIR, specifier.slice(2))
    : path.resolve(baseDir, specifier);

  const candidates = [
    mapped,
    `${mapped}.ts`,
    `${mapped}.tsx`,
    `${mapped}.js`,
    path.join(mapped, "index.ts"),
    path.join(mapped, "index.tsx"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
}

/**
 * Loads a TypeScript module in Node for unit tests without needing Expo/Metro.
 * Stubs `.css`, `react-native`, and `lib/supabase` cleanly.
 */
export function loadTsModule(relOrAbsPath) {
  const filePath = path.isAbsolute(relOrAbsPath)
    ? relOrAbsPath
    : path.join(ROOT_DIR, relOrAbsPath);

  if (moduleCache.has(filePath)) {
    return moduleCache.get(filePath).exports;
  }

  const source = fs.readFileSync(filePath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });

  const mod = { exports: {} };
  moduleCache.set(filePath, mod);

  const customRequire = (specifier) => {
    if (specifier.endsWith(".css")) {
      return {};
    }
    if (specifier === "expo-linking") {
      return {
        createURL: (path = "", opts = {}) => {
          const query = opts?.queryParams
            ? `?${new URLSearchParams(opts.queryParams).toString()}`
            : "";
          return `https://devlearn.local/${String(path).replace(/^\//, "")}${query}`;
        },
      };
    }
    if (specifier === "react-native") {
      return {
        Platform: {
          OS: "web",
          select: (obj) => obj.web ?? obj.default,
        },
      };
    }
    if (specifier.endsWith("/lib/supabase") || specifier === "../../lib/supabase") {
      return {
        supabase: {
          from: () => ({
            select: () => Promise.resolve({ data: [], error: null }),
          }),
        },
      };
    }
    if (
      specifier.startsWith(".") ||
      specifier.startsWith("@/")
    ) {
      const resolved = resolveLocalFile(path.dirname(filePath), specifier);
      if (resolved) {
        if (resolved.endsWith(".ts") || resolved.endsWith(".tsx")) {
          return loadTsModule(resolved);
        }
        return require(resolved);
      }
    }
    return require(specifier);
  };

  const fn = new Function(
    "exports",
    "require",
    "module",
    "__filename",
    "__dirname",
    outputText,
  );
  fn(mod.exports, customRequire, mod, filePath, path.dirname(filePath));
  return mod.exports;
}
