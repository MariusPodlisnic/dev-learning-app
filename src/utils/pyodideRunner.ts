import { Platform } from "react-native";
import { Lesson, TestCaseResult } from "../types/lesson";

export function loadPyodideScript(
  pyodideRef: { current: any },
  onReady: () => void,
) {
  if (typeof window === "undefined") return;
  if ("loadPyodide" in window && pyodideRef.current) {
    onReady();
    return;
  }
  try {
    if (!document.getElementById("pyodide-script")) {
      const script = document.createElement("script");
      script.id = "pyodide-script";
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";
      script.onload = async () => {
        if ((window as any).loadPyodide) {
          pyodideRef.current = await (window as any).loadPyodide();
          onReady();
        }
      };
      document.head.appendChild(script);
    }
  } catch (err) {
    console.error("Failed to load Pyodide engine:", err);
  }
}

export async function executePlaygroundPython(
  pyodideInstance: any,
  code: string,
): Promise<string> {
  if (Platform.OS !== "web" || !pyodideInstance) {
    return "Python runtime is initializing...";
  }
  try {
    let stdoutBuffer = "";
    pyodideInstance.setStdout({
      batched: (str: string) => {
        stdoutBuffer += str + "\n";
      },
    });
    const result = await pyodideInstance.runPythonAsync(code);
    return (
      stdoutBuffer.trim() ||
      (result !== undefined
        ? String(result).trim()
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
  if (Platform.OS !== "web" || !pyodideInstance) {
    return {
      allPassed: false,
      testResults: null,
      consoleOutput: "Python runtime is still initializing.",
      targetTab: "console",
    };
  }

  try {
    let stdoutBuffer = "";
    pyodideInstance.setStdout({
      batched: (str: string) => {
        stdoutBuffer += str + "\n";
      },
    });

    const executionCode = selectedLesson?.hidden_tests
      ? `${code}\n${selectedLesson.hidden_tests}`
      : code;
    const result = await pyodideInstance.runPythonAsync(executionCode);
    const rawOutput = stdoutBuffer.trim();

    let parsedResult: any = null;
    try {
      parsedResult = JSON.parse(String(result));
    } catch (_e) {}

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

      if (expectedStdout && selectedLesson?.track === "python_basics") {
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

export async function executeBugPatchVerification(
  pyodideInstance: any,
  userCode: string,
  testHarness: string,
): Promise<{
  allPassed: boolean;
  results: TestCaseResult[];
  stdout: string;
  error?: string;
}> {
  try {
    if (Platform.OS === "web" && pyodideInstance) {
      let stdoutBuffer = "";
      pyodideInstance.setStdout({
        batched: (str: string) => {
          stdoutBuffer += str + "\n";
        },
      });
      const fullScript = `${userCode}\n${testHarness}`;
      const rawRes = await pyodideInstance.runPythonAsync(fullScript);
      const parsed = JSON.parse(String(rawRes));
      return {
        allPassed: Boolean(parsed.all_passed),
        results: parsed.results || [],
        stdout: stdoutBuffer.trim(),
      };
    }
    return {
      allPassed: false,
      results: [],
      stdout: "",
      error: "Python engine is still initializing.",
    };
  } catch (err: any) {
    return {
      allPassed: false,
      results: [],
      stdout: "",
      error: err.message || String(err),
    };
  }
}
