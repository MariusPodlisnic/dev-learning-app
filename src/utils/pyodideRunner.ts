import { Platform } from "react-native";
import type { LessonEnrichment } from "../constants/curriculum";
import type { Lesson, TestCaseResult } from "../types/lesson";
import {
  buildPythonTraceRunnerScript,
  extractSampleTraceDriver,
  parsePythonTraceOutput,
  type PythonTraceResult,
} from "./pythonTrace";

export interface NativePythonExecutionResult {
  stdout: string;
  result?: unknown;
}

export type NativePythonExecutor = (
  code: string,
) => Promise<NativePythonExecutionResult>;

export interface PythonRuntimeStatus {
  available: boolean;
  mode: "web_pyodide" | "native_bridge" | "web_only_notice";
  badgeLabel: string;
  editorLabel: string;
  unavailableMessage: string;
}

export type NativeBridgeLifecycleState =
  | "unmounted"
  | "initializing"
  | "ready"
  | "error";

const NATIVE_UNAVAILABLE_MESSAGE =
  "Live in-app Python execution runs via Pyodide in Web browsers or via a connected native runtime bridge. You can still inspect lessons, hints, and draft solutions here.";
const NATIVE_WARMING_MESSAGE =
  "Native Python 3.11 bridge is warming up — try running again in a few seconds!";

let sharedPyodideInstance: any = null;
let sharedPyodidePromise: Promise<any> | null = null;
let nativePythonExecutor: NativePythonExecutor | null = null;
let nativeBridgeState: NativeBridgeLifecycleState = "unmounted";
let nativeBridgeError: string | null = null;

interface NativeRuntimeSubscriber {
  onReady: () => void;
  onError?: (err: unknown) => void;
}

const nativeSubscribers = new Set<NativeRuntimeSubscriber>();

export function setNativeBridgeState(
  state: Exclude<NativeBridgeLifecycleState, "ready">,
  errorMessage?: string,
): void {
  nativeBridgeState = state;
  nativeBridgeError = state === "error" ? errorMessage || null : null;
  if (state === "error") {
    nativePythonExecutor = null;
    const errObj = new Error(
      nativeBridgeError || "Native Python bridge failed to load.",
    );
    for (const sub of nativeSubscribers) {
      sub.onError?.(errObj);
    }
  }
}

export function registerNativePythonExecutor(
  executor: NativePythonExecutor | null,
): void {
  nativePythonExecutor = executor;
  if (executor) {
    nativeBridgeState = "ready";
    nativeBridgeError = null;
    for (const sub of nativeSubscribers) {
      sub.onReady();
    }
  } else if (nativeBridgeState === "ready") {
    nativeBridgeState = "unmounted";
  }
}

export function isNativePythonSupported(): boolean {
  return Platform.OS !== "web" && nativePythonExecutor !== null;
}

export function isPythonExecutionAvailable(pyodideReady: boolean): boolean {
  return Platform.OS === "web" ? pyodideReady : nativePythonExecutor !== null;
}

export function getPythonRuntimeStatus(
  pyodideReady: boolean,
): PythonRuntimeStatus {
  if (Platform.OS === "web") {
    return {
      available: pyodideReady,
      mode: "web_pyodide",
      badgeLabel: pyodideReady ? "🐍 PY 3.11" : "⏱️ LOADING...",
      editorLabel: pyodideReady ? "READY · ⌘↵" : "INITIALIZING",
      unavailableMessage: "Python 3.11 WebAssembly runtime is initializing...",
    };
  }
  if (nativePythonExecutor) {
    return {
      available: true,
      mode: "native_bridge",
      badgeLabel: "🐍 PY BRIDGE",
      editorLabel: "NATIVE READY",
      unavailableMessage: NATIVE_UNAVAILABLE_MESSAGE,
    };
  }
  if (nativeBridgeState === "initializing") {
    return {
      available: false,
      mode: "native_bridge",
      badgeLabel: "⏱️ PY BRIDGE...",
      editorLabel: "WARMING UP",
      unavailableMessage: NATIVE_WARMING_MESSAGE,
    };
  }
  if (nativeBridgeState === "error") {
    return {
      available: false,
      mode: "native_bridge",
      badgeLabel: "⚠️ OFFLINE",
      editorLabel: "BRIDGE OFFLINE",
      unavailableMessage:
        nativeBridgeError ||
        "Could not load the native Python bridge (check internet connection).",
    };
  }
  return {
    available: false,
    mode: "web_only_notice",
    badgeLabel: "📱 STUDY MODE",
    editorLabel: "WEB RUNTIME",
    unavailableMessage: NATIVE_UNAVAILABLE_MESSAGE,
  };
}

function resolveSharedPyodide(): Promise<any> {
  if (
    Platform.OS !== "web" ||
    typeof window === "undefined" ||
    typeof document === "undefined"
  ) {
    return Promise.reject(new Error("Pyodide requires a browser runtime."));
  }
  if (sharedPyodideInstance) {
    return Promise.resolve(sharedPyodideInstance);
  }
  if (sharedPyodidePromise) {
    return sharedPyodidePromise;
  }

  sharedPyodidePromise = new Promise((resolve, reject) => {
    const bootInstance = async () => {
      try {
        if (!(window as any).loadPyodide) {
          throw new Error("Pyodide loader not found on window.");
        }
        const instance = await (window as any).loadPyodide();
        sharedPyodideInstance = instance;
        resolve(instance);
      } catch (err) {
        sharedPyodidePromise = null;
        reject(err);
      }
    };

    if ((window as any).loadPyodide) {
      bootInstance();
      return;
    }

    const existingScript = document.getElementById(
      "pyodide-script",
    ) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        void bootInstance();
      }, { once: true });
      existingScript.addEventListener(
        "error",
        () => {
          sharedPyodidePromise = null;
          reject(new Error("Failed to load Pyodide script."));
        },
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = "pyodide-script";
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";
    script.onload = () => {
      void bootInstance();
    };
    script.onerror = () => {
      sharedPyodidePromise = null;
      reject(new Error("Failed to load Pyodide script."));
    };
    document.head.appendChild(script);
  });

  return sharedPyodidePromise;
}

async function runPythonScript(
  pyodideInstance: any,
  script: string,
): Promise<NativePythonExecutionResult | null> {
  if (Platform.OS === "web" && pyodideInstance) {
    if (
      /\bsqlite3\b/.test(script) &&
      typeof pyodideInstance.loadPackagesFromImports === "function"
    ) {
      await pyodideInstance.loadPackagesFromImports(script);
    }
    let stdoutBuffer = "";
    pyodideInstance.setStdout({
      batched: (str: string) => {
        stdoutBuffer += str + "\n";
      },
    });
    const result = await pyodideInstance.runPythonAsync(script);
    return {
      stdout: stdoutBuffer.trim(),
      result,
    };
  }
  if (Platform.OS !== "web" && nativePythonExecutor) {
    const nativeRes = await nativePythonExecutor(script);
    return {
      stdout: (nativeRes.stdout || "").trim(),
      result: nativeRes.result,
    };
  }
  return null;
}

export function loadPyodideScript(
  pyodideRef: { current: any },
  onReady: () => void,
  onError?: (err: unknown) => void,
): () => void {
  if (Platform.OS !== "web") {
    const subscriber: NativeRuntimeSubscriber = { onReady, onError };
    nativeSubscribers.add(subscriber);
    if (nativePythonExecutor) {
      onReady();
    } else if (nativeBridgeState === "error") {
      onError?.(
        new Error(
          nativeBridgeError || "Native Python runtime failed to initialize.",
        ),
      );
    }
    return () => {
      nativeSubscribers.delete(subscriber);
    };
  }
  if (typeof window === "undefined") {
    return () => {};
  }
  if (sharedPyodideInstance) {
    pyodideRef.current = sharedPyodideInstance;
    onReady();
    return () => {};
  }

  let cancelled = false;
  resolveSharedPyodide()
    .then((instance) => {
      if (cancelled) return;
      pyodideRef.current = instance;
      onReady();
    })
    .catch((err) => {
      if (cancelled) return;
      console.error("Failed to load Pyodide engine:", err);
      onError?.(err);
    });

  return () => {
    cancelled = true;
  };
}

export async function executePlaygroundPython(
  pyodideInstance: any,
  code: string,
): Promise<string> {
  const status = getPythonRuntimeStatus(Boolean(pyodideInstance));
  if (!status.available) {
    return status.unavailableMessage;
  }
  try {
    const execRes = await runPythonScript(pyodideInstance, code);
    if (!execRes) {
      return status.unavailableMessage;
    }
    return (
      execRes.stdout ||
      (execRes.result !== undefined
        ? String(execRes.result).trim()
        : "Code ran with no output. Use print() to see values!")
    );
  } catch (err: any) {
    return `[SYNTAX // TRACE] Check your Python syntax:\n${err.message || String(err)}`;
  }
}

export interface LessonVerificationOutcome {
  allPassed: boolean;
  testResults: TestCaseResult[] | null;
  consoleOutput: string;
  targetTab: "console" | "tests";
}

export async function executeLessonVerification(
  pyodideInstance: any,
  code: string,
  selectedLesson: Lesson | null,
): Promise<LessonVerificationOutcome> {
  const status = getPythonRuntimeStatus(Boolean(pyodideInstance));
  if (!status.available) {
    return {
      allPassed: false,
      testResults: null,
      consoleOutput: status.unavailableMessage,
      targetTab: "console",
    };
  }

  try {
    const executionCode = selectedLesson?.hidden_tests
      ? `${code}\n${selectedLesson.hidden_tests}`
      : code;
    const execRes = await runPythonScript(pyodideInstance, executionCode);
    if (!execRes) {
      return {
        allPassed: false,
        testResults: null,
        consoleOutput: status.unavailableMessage,
        targetTab: "console",
      };
    }

    const result = execRes.result;
    let rawOutput = execRes.stdout;

    let parsedResult: any = null;
    try {
      parsedResult = JSON.parse(String(result));
    } catch {}

    if (!parsedResult || !parsedResult.is_test_suite) {
      const lines = rawOutput.split("\n");
      const lastLine = lines[lines.length - 1]?.trim() || "";
      if (lastLine.startsWith("{") && lastLine.includes('"is_test_suite"')) {
        try {
          parsedResult = JSON.parse(lastLine);
          rawOutput = lines.slice(0, -1).join("\n").trim();
        } catch {}
      }
    }

    if (parsedResult && parsedResult.is_test_suite) {
      if (parsedResult.error) {
        return {
          allPassed: false,
          testResults: null,
          consoleOutput: `[RUNTIME // ERROR]\n${parsedResult.error}\n\nConsole:\n${rawOutput}`,
          targetTab: "console",
        };
      }

      const expectedStdout = selectedLesson?.expected_output
        ?.replace(/\\n/g, "\n")
        .trim();
      const resultsList: TestCaseResult[] = [...parsedResult.results];
      let allPassed = Boolean(parsedResult.all_passed);

      if (
        resultsList.length === 0 &&
        expectedStdout &&
        selectedLesson?.track === "python_basics"
      ) {
        const stdoutMatch = rawOutput === expectedStdout;
        resultsList.push({
          id: resultsList.length + 1,
          input: "Check printed console output",
          expected: expectedStdout,
          actual: rawOutput || "(Nothing printed)",
          passed: stdoutMatch,
        });
        if (!stdoutMatch) allPassed = false;
      }

      return {
        allPassed,
        testResults: resultsList,
        consoleOutput: rawOutput || "Code executed. See Assertions tab.",
        targetTab: "tests",
      };
    }

    let finalLogs =
      rawOutput ||
      (result !== undefined ? String(result).trim() : "No output");
    let allPassed = false;

    if (selectedLesson?.expected_output) {
      const expected = selectedLesson.expected_output
        .replace(/\\n/g, "\n")
        .trim();
      if (rawOutput === expected) {
        finalLogs += "\n\n✓ Verification Passed (+50 XP)";
        allPassed = true;
      } else {
        finalLogs += `\n\n✕ Output mismatch. Expected output:\n${expected}`;
      }
    }

    return {
      allPassed,
      testResults: null,
      consoleOutput: finalLogs,
      targetTab: "console",
    };
  } catch (err: any) {
    return {
      allPassed: false,
      testResults: null,
      consoleOutput: `[RUNTIME // TRACE]\n${err.message || String(err)}`,
      targetTab: "console",
    };
  }
}

const AUTO_TEST_CASES_EVAL_TRAILER = `
import json as __devy_json__
__devy_results__ = []
__devy_all_ok__ = True
for __devy_i__, (__devy_lbl__, __devy_fn__, __devy_exp__) in enumerate(__test_cases__):
    try:
        __devy_act__ = __devy_fn__()
        __devy_ok__ = __devy_act__ == __devy_exp__
    except Exception as __devy_err__:
        __devy_act__ = f"{type(__devy_err__).__name__}: {__devy_err__}"
        __devy_ok__ = False
    if not __devy_ok__:
        __devy_all_ok__ = False
    __devy_results__.append({
        "id": __devy_i__ + 1,
        "input": str(__devy_lbl__),
        "expected": repr(__devy_exp__),
        "actual": repr(__devy_act__),
        "passed": __devy_ok__,
    })
__devy_json__.dumps({"is_test_suite": True, "all_passed": __devy_all_ok__, "results": __devy_results__})
`;

/**
 * Combines user Python code with any verification harness format:
 * - JSON-returning harnesses (Bug Hunt, Mock Interview)
 * - `TEST_RESULT|...` stdout harnesses (Refactor Golf)
 * - Declarative `__test_cases__ = [...]` harnesses (Mini-Builds, 3-Stage Blueprints)
 */
export function buildVerificationScript(
  userCode: string,
  testHarness: string,
): string {
  const needsAutoCasesRunner =
    testHarness.includes("__test_cases__") &&
    !testHarness.includes("TEST_RESULT|") &&
    !testHarness.includes("json.dumps");

  return needsAutoCasesRunner
    ? `${userCode}\n${testHarness}\n${AUTO_TEST_CASES_EVAL_TRAILER}`
    : `${userCode}\n${testHarness}`;
}

/**
 * Parses verification results from either JSON return values or `TEST_RESULT|` stdout lines.
 */
export function parseVerificationExecutionOutput(
  resultValue: unknown,
  stdout: string,
): {
  allPassed: boolean;
  results: TestCaseResult[];
  error?: string;
} {
  const rawResult =
    resultValue !== undefined && resultValue !== null
      ? String(resultValue).trim()
      : "";

  if (rawResult.startsWith("{")) {
    try {
      const parsed = JSON.parse(rawResult);
      const results: TestCaseResult[] = Array.isArray(parsed.results)
        ? parsed.results
        : [];
      return {
        allPassed: Boolean(parsed.all_passed),
        results,
        error: parsed.error ? String(parsed.error) : undefined,
      };
    } catch {
      // Fall through to stdout parsers below
    }
  }

  const lines = (stdout || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Check if stdout emitted a JSON test suite line
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (lines[i].startsWith("{") && lines[i].includes('"is_test_suite"')) {
      try {
        const parsed = JSON.parse(lines[i]);
        return {
          allPassed: Boolean(parsed.all_passed),
          results: Array.isArray(parsed.results) ? parsed.results : [],
          error: parsed.error ? String(parsed.error) : undefined,
        };
      } catch {
        break;
      }
    }
  }

  // Parse pipe-delimited TEST_RESULT|label|expected|actual|True lines (Refactor Golf)
  const pipeLines = lines.filter((l) => l.startsWith("TEST_RESULT|"));
  if (pipeLines.length > 0) {
    const results: TestCaseResult[] = pipeLines.map((line, idx) => {
      const parts = line.split("|");
      const passedRaw = parts[parts.length - 1];
      const actual = parts[parts.length - 2] ?? "";
      const expected = parts[parts.length - 3] ?? "";
      const input = parts.slice(1, parts.length - 3).join("|");
      return {
        id: idx + 1,
        input,
        expected,
        actual,
        passed: passedRaw === "True",
      };
    });
    return {
      allPassed: results.every((r) => r.passed),
      results,
    };
  }

  return {
    allPassed: false,
    results: [],
    error: "Verification harness did not emit structured test results.",
  };
}

export async function executeBugPatchVerification(
  pyodideInstance: any,
  userCode: string,
  testHarness: string,
): Promise<{
  allPassed: boolean;
  results: TestCaseResult[];
  stdout: string;
  error?: string;
  errorMessage?: string;
}> {
  const status = getPythonRuntimeStatus(Boolean(pyodideInstance));
  if (!status.available) {
    return {
      allPassed: false,
      results: [],
      stdout: "",
      error: status.unavailableMessage,
      errorMessage: status.unavailableMessage,
    };
  }
  try {
    const fullScript = buildVerificationScript(userCode, testHarness);
    const execRes = await runPythonScript(pyodideInstance, fullScript);
    if (!execRes) {
      return {
        allPassed: false,
        results: [],
        stdout: "",
        error: status.unavailableMessage,
        errorMessage: status.unavailableMessage,
      };
    }
    const parsed = parseVerificationExecutionOutput(
      execRes.result,
      execRes.stdout,
    );
    return {
      allPassed: parsed.allPassed,
      results: parsed.results,
      stdout: execRes.stdout,
      error: parsed.error,
      errorMessage: parsed.error,
    };
  } catch (err: any) {
    const msg = err.message || String(err);
    return {
      allPassed: false,
      results: [],
      stdout: "",
      error: msg,
      errorMessage: msg,
    };
  }
}

export async function executePythonTrace(
  pyodideInstance: any,
  userCode: string,
  options?: {
    lesson?: Lesson | null;
    enrichment?: LessonEnrichment | null;
    driverCode?: string;
    maxSteps?: number;
  },
): Promise<PythonTraceResult> {
  const { driverCode: resolvedDriver } = extractSampleTraceDriver(
    userCode,
    options?.lesson,
    options?.enrichment,
    options?.driverCode,
  );
  const status = getPythonRuntimeStatus(Boolean(pyodideInstance));
  if (!status.available) {
    return {
      ok: false,
      frames: [],
      totalSteps: 0,
      truncated: false,
      driverUsed: resolvedDriver,
      finalStdout: "",
      error: status.unavailableMessage,
    };
  }

  try {
    const traceScript = buildPythonTraceRunnerScript(
      userCode,
      resolvedDriver,
      options?.maxSteps ?? 120,
    );
    const execRes = await runPythonScript(pyodideInstance, traceScript);
    if (!execRes) {
      return {
        ok: false,
        frames: [],
        totalSteps: 0,
        truncated: false,
        driverUsed: resolvedDriver,
        finalStdout: "",
        error: status.unavailableMessage,
      };
    }
    return parsePythonTraceOutput(execRes.result, resolvedDriver);
  } catch (err: any) {
    return {
      ok: false,
      frames: [],
      totalSteps: 0,
      truncated: false,
      driverUsed: resolvedDriver,
      finalStdout: "",
      error: err?.message || String(err),
    };
  }
}
