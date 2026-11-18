import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const React = require("react");

export const ROOT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

const moduleCache = new Map();
const mockPlatformState = { OS: "web" };
const mockViewportState = { width: 1280, height: 800 };
const mockAsyncStorageStore = new Map();

export function setMockPlatformOS(os) {
  mockPlatformState.OS = os;
}

export function setMockViewport(width, height = 800) {
  mockViewportState.width = width;
  mockViewportState.height = height;
}

export function getMockAsyncStorageStore() {
  return mockAsyncStorageStore;
}

export function clearModuleCache() {
  moduleCache.clear();
}

function createHostComponent(tagName) {
  return function MockHost({ children, style, accessibilityLabel, accessibilityRole, accessibilityState, ...rest }) {
    const resolvedStyle = typeof style === "function" ? style({ pressed: false }) : style;
    const flatProps = {
      ...(accessibilityLabel ? { "aria-label": accessibilityLabel } : {}),
      ...(accessibilityRole ? { role: accessibilityRole } : {}),
      ...(accessibilityState?.selected !== undefined
        ? { "aria-selected": accessibilityState.selected }
        : {}),
      ...(resolvedStyle && !Array.isArray(resolvedStyle) && typeof resolvedStyle === "object"
        ? {}
        : {}),
    };
    if (tagName === "textarea") {
      return React.createElement("textarea", {
        ...flatProps,
        defaultValue: rest.value ?? "",
        readOnly: true,
      });
    }
    const content =
      typeof children === "function" ? children({ pressed: false }) : children;
    return React.createElement(tagName, flatProps, content);
  };
}

function createAnimatedValue(initial) {
  return {
    _value: initial,
    setValue(v) {
      this._value = v;
    },
    stopAnimation(cb) {
      if (typeof cb === "function") cb(this._value);
    },
    interpolate() {
      return "0deg";
    },
  };
}

function createNoopAnimation() {
  return {
    start(cb) {
      if (typeof cb === "function") cb({ finished: true });
    },
    stop() {},
    reset() {},
  };
}

const MockView = createHostComponent("div");
const MockText = createHostComponent("span");
const MockPressable = createHostComponent("button");
const MockTextInput = createHostComponent("textarea");

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
 * Loads a TypeScript/TSX module in Node for unit and UI smoke tests without Expo/Metro.
 * Stubs React Native primitives, Expo Router, `.css`, audio assets, and `lib/supabase`.
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
      jsx: ts.JsxEmit.ReactJSX,
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
    if (/\.(wav|mp3|png|jpg|jpeg|svg|ttf|woff2?)$/i.test(specifier)) {
      return 1;
    }
    if (specifier === "expo-linking") {
      return {
        createURL: (routePath = "", opts = {}) => {
          const query = opts?.queryParams
            ? `?${new URLSearchParams(opts.queryParams).toString()}`
            : "";
          return `https://devlearn.local/${String(routePath).replace(/^\//, "")}${query}`;
        },
      };
    }
    if (specifier === "expo-router") {
      const Passthrough = ({ children }) => React.createElement(React.Fragment, null, children);
      return {
        router: { push: () => {}, replace: () => {}, back: () => {} },
        Link: Passthrough,
        Stack: Object.assign(Passthrough, { Screen: () => null }),
        useLocalSearchParams: () => ({}),
      };
    }
    if (specifier === "expo-router/head") {
      return {
        __esModule: true,
        default: ({ children }) => React.createElement(React.Fragment, null, children),
      };
    }
    if (specifier === "expo-audio") {
      return {
        createAudioPlayer: () => ({
          volume: 1,
          play: () => {},
          seekTo: async () => {},
          remove: () => {},
        }),
        setAudioModeAsync: async () => {},
      };
    }
    if (specifier === "expo-haptics") {
      return {
        ImpactFeedbackStyle: { Light: "Light", Medium: "Medium", Heavy: "Heavy" },
        NotificationFeedbackType: {
          Success: "Success",
          Warning: "Warning",
          Error: "Error",
        },
        selectionAsync: async () => {},
        impactAsync: async () => {},
        notificationAsync: async () => {},
      };
    }
    if (specifier === "expo-device") {
      return { isDevice: false, modelName: "TestDevice" };
    }
    if (specifier === "expo-image") {
      return { Image: MockView };
    }
    if (specifier === "expo-symbols") {
      return { SymbolView: MockView };
    }
    if (specifier === "expo-glass-effect") {
      return { GlassView: MockView, isLiquidGlassAvailable: () => false };
    }
    if (specifier === "expo-linking") {
      return {
        createURL: (p = "") => `devlearningapp://${p}`,
      };
    }
    if (specifier === "expo-web-browser") {
      return {
        maybeCompleteAuthSession: () => ({ type: "dismiss" }),
        openAuthSessionAsync: async () => ({ type: "cancel" }),
      };
    }
    if (specifier === "react-native-webview") {
      return { WebView: MockView };
    }
    if (specifier === "react-native-safe-area-context") {
      return {
        SafeAreaProvider: MockView,
        SafeAreaView: MockView,
        useSafeAreaInsets: () => ({ top: 0, bottom: 16, left: 0, right: 0 }),
      };
    }
    if (specifier === "react-native") {
      return {
        Platform: {
          get OS() {
            return mockPlatformState.OS;
          },
          select: (obj) => obj[mockPlatformState.OS] ?? obj.default,
        },
        StyleSheet: {
          create: (styles) => styles,
          flatten: function flattenStyle(input) {
            if (!input) return undefined;
            if (!Array.isArray(input)) return input;
            return Object.assign(
              {},
              ...input.map((item) => flattenStyle(item)).filter(Boolean),
            );
          },
          absoluteFill: {},
          absoluteFillObject: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
        },
        View: MockView,
        ActivityIndicator: MockView,
        Text: MockText,
        Pressable: MockPressable,
        ScrollView: MockView,
        SafeAreaView: MockView,
        KeyboardAvoidingView: MockView,
        TextInput: MockTextInput,
        useWindowDimensions: () => ({
          width: mockViewportState.width,
          height: mockViewportState.height,
        }),
        Keyboard: {
          addListener: () => ({ remove: () => {} }),
          dismiss: () => {},
        },
        PanResponder: {
          create: () => ({ panHandlers: {} }),
        },
        AppState: {
          currentState: "active",
          addEventListener: () => ({ remove: () => {} }),
        },
        Easing: {
          linear: (t) => t,
          sin: (t) => Math.sin((t * Math.PI) / 2),
          quad: (t) => t * t,
          cubic: (t) => t * t * t,
          inOut: (fn) => fn,
          out: (fn) => fn,
        },
        Animated: {
          View: MockView,
          Text: MockText,
          Value: function Value(init) {
            return createAnimatedValue(init);
          },
          timing: createNoopAnimation,
          spring: createNoopAnimation,
          delay: createNoopAnimation,
          sequence: createNoopAnimation,
          parallel: createNoopAnimation,
          loop: createNoopAnimation,
          multiply: (a, b) => createAnimatedValue((a?._value ?? 1) * (b?._value ?? 1)),
          add: (a, b) => createAnimatedValue((a?._value ?? 0) + (b?._value ?? 0)),
        },
      };
    }
    if (specifier === "@react-native-async-storage/async-storage") {
      return {
        __esModule: true,
        default: {
          getItem: async (key) =>
            mockAsyncStorageStore.has(key)
              ? mockAsyncStorageStore.get(key)
              : null,
          setItem: async (key, value) => {
            mockAsyncStorageStore.set(key, String(value));
          },
          removeItem: async (key) => {
            mockAsyncStorageStore.delete(key);
          },
          multiGet: async (keys) =>
            keys.map((key) => [
              key,
              mockAsyncStorageStore.has(key)
                ? mockAsyncStorageStore.get(key)
                : null,
            ]),
          getMany: async (keys) => {
            const out = {};
            for (const key of keys) {
              out[key] = mockAsyncStorageStore.has(key)
                ? mockAsyncStorageStore.get(key)
                : null;
            }
            return out;
          },
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
