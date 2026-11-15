import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { loadTsModule, setMockPlatformOS } from "./helpers/loadTs.mjs";

const {
  executeBugPatchVerification,
  executeLessonVerification,
  executePlaygroundPython,
  getPythonRuntimeStatus,
  isNativePythonSupported,
  loadPyodideScript,
  registerNativePythonExecutor,
  setNativeBridgeState,
} = loadTsModule("src/utils/pyodideRunner.ts");

const {
  PYODIDE_BRIDGE_HTML,
  buildInjectedExecJs,
  parseBridgeMessage,
} = loadTsModule("src/utils/nativePythonProtocol.ts");

function createPython3MockPyodide() {
  let stdoutHandler = null;
  return {
    setStdout({ batched }) {
      stdoutHandler = batched;
    },
    async runPythonAsync(code) {
      const proc = spawnSync(
        "/usr/bin/python3",
        [
          "-c",
          `
import io, json, sys
from contextlib import redirect_stdout
src = sys.stdin.read()
buf = io.StringIO()
ns = {}
with redirect_stdout(buf):
    exec(compile(src, "<student>", "exec"), ns, ns)
    ret = ns["__run_tests__"]() if "__run_tests__" in ns and callable(ns["__run_tests__"]) else None
print(json.dumps({"stdout": buf.getvalue(), "ret": ret}))
`,
        ],
        { input: code, encoding: "utf8" },
      );
      if (proc.status !== 0) {
        throw new Error(proc.stderr || "Python execution error");
      }
      const { stdout, ret } = JSON.parse(proc.stdout);
      if (stdout && stdoutHandler) {
        for (const line of stdout.split("\n")) {
          if (line) stdoutHandler(line);
        }
      }
      return ret;
    },
  };
}

test("executeLessonVerification passes python_basics without requiring extra print() when unit tests pass", async () => {
  const pyodide = createPython3MockPyodide();
  const lesson = {
    id: "exp-py-01",
    track: "python_basics",
    expected_output: "('Aria', 150, True)",
    hidden_tests: `import json
def __run_tests__():
    r1 = create_hero_profile("Aria", 50)
    return json.dumps({
        "is_test_suite": True,
        "all_passed": r1 == ("Aria", 150, True),
        "results": [{"id": 1, "input": "'Aria', 50", "expected": "('Aria', 150, True)", "actual": str(r1), "passed": r1 == ("Aria", 150, True)}]
    })
__run_tests__()`,
  };

  const passOutcome = await executeLessonVerification(
    pyodide,
    `def create_hero_profile(name, bonus_hp):\n    return (name, 100 + bonus_hp, True)`,
    lesson,
  );
  assert.equal(passOutcome.allPassed, true);
  assert.equal(passOutcome.testResults?.length, 1);
  assert.equal(passOutcome.targetTab, "tests");

  const failOutcome = await executeLessonVerification(
    pyodide,
    `def create_hero_profile(name, bonus_hp):\n    pass`,
    lesson,
  );
  assert.equal(failOutcome.allPassed, false);
});

test("executePlaygroundPython formats syntax errors cleanly", async () => {
  const pyodide = createPython3MockPyodide();
  const out = await executePlaygroundPython(pyodide, "def broken(:");
  assert.match(out, /SYNTAX \/\/ TRACE/);
});

test("native Python runtime reports study notice without bridge and executes cleanly with registered native executor", async () => {
  setMockPlatformOS("ios");
  registerNativePythonExecutor(null);

  assert.equal(isNativePythonSupported(), false);
  const studyStatus = getPythonRuntimeStatus(false);
  assert.equal(studyStatus.available, false);
  assert.equal(studyStatus.mode, "web_only_notice");
  assert.equal(studyStatus.badgeLabel, "📱 STUDY MODE");

  const unavailableOut = await executePlaygroundPython(null, "print(42)");
  assert.match(unavailableOut, /Web browsers|native runtime bridge/i);

  const unavailablePatch = await executeBugPatchVerification(
    null,
    "def fix(): pass",
    "{}",
  );
  assert.equal(unavailablePatch.allPassed, false);
  assert.match(unavailablePatch.error || "", /Web browsers|native runtime bridge/i);

  // Register a native executor backed by Python3 mock
  const mockPyodide = createPython3MockPyodide();
  registerNativePythonExecutor(async (script) => {
    let stdout = "";
    mockPyodide.setStdout({
      batched: (line) => {
        stdout += `${line}\n`;
      },
    });
    const result = await mockPyodide.runPythonAsync(script);
    return { stdout: stdout.trim(), result };
  });

  assert.equal(isNativePythonSupported(), true);
  const bridgeStatus = getPythonRuntimeStatus(false);
  assert.equal(bridgeStatus.available, true);
  assert.equal(bridgeStatus.mode, "native_bridge");

  const bridgeOut = await executePlaygroundPython(null, "print('native-ok')");
  assert.equal(bridgeOut, "native-ok");

  registerNativePythonExecutor(null);
  setMockPlatformOS("web");
});

test("nativePythonProtocol builds safe JS injection calls and parses WebView messages", () => {
  assert.match(PYODIDE_BRIDGE_HTML, /window\.__devlearnRunPython/);
  assert.match(PYODIDE_BRIDGE_HTML, /pyodide\.js/);

  const jsCall = buildInjectedExecJs("py_req_1", 'print("hi")\nreturn 1 + 2');
  assert.ok(jsCall.endsWith("; true;"));
  assert.match(jsCall, /"py_req_1"/);
  assert.match(jsCall, /"print\(\\"hi\\"\)\\nreturn 1 \+ 2"/);

  assert.deepEqual(parseBridgeMessage('{"type":"ready"}'), { type: "ready" });
  assert.deepEqual(
    parseBridgeMessage('{"type":"init_error","error":"network down"}'),
    { type: "init_error", error: "network down" },
  );
  assert.deepEqual(
    parseBridgeMessage(
      '{"type":"result","requestId":"py_req_1","stdout":"hi","result":3}',
    ),
    { type: "result", requestId: "py_req_1", stdout: "hi", result: 3 },
  );
  assert.deepEqual(
    parseBridgeMessage(
      '{"type":"error","requestId":"py_req_1","error":"SyntaxError"}',
    ),
    { type: "error", requestId: "py_req_1", error: "SyntaxError" },
  );
  assert.equal(parseBridgeMessage("not-json"), null);
});

test("native bridge lifecycle notifies subscribed listeners on ready and error transitions", () => {
  setMockPlatformOS("android");
  registerNativePythonExecutor(null);
  setNativeBridgeState("initializing");

  const warming = getPythonRuntimeStatus(false);
  assert.equal(warming.available, false);
  assert.equal(warming.mode, "native_bridge");
  assert.equal(warming.badgeLabel, "⏱️ PY BRIDGE...");

  let readyCount = 0;
  let errorSeen = null;
  const unsub = loadPyodideScript(
    { current: null },
    () => {
      readyCount += 1;
    },
    (err) => {
      errorSeen = err;
    },
  );
  assert.equal(readyCount, 0);

  registerNativePythonExecutor(async () => ({ stdout: "ok", result: "ok" }));
  assert.equal(readyCount, 1);
  assert.equal(getPythonRuntimeStatus(true).badgeLabel, "🐍 PY BRIDGE");

  setNativeBridgeState("error", "Offline CDN");
  assert.ok(errorSeen instanceof Error);
  assert.equal(getPythonRuntimeStatus(false).badgeLabel, "⚠️ OFFLINE");

  unsub();
  registerNativePythonExecutor(null);
  setNativeBridgeState("unmounted");
  setMockPlatformOS("web");
});
