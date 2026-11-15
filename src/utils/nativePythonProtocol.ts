export const PYODIDE_CDN_SCRIPT_URL =
  "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";
export const PYODIDE_INDEX_URL =
  "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/";

export type NativeBridgeMessage =
  | { type: "ready" }
  | { type: "init_error"; error: string }
  | { type: "result"; requestId: string; stdout: string; result?: unknown }
  | { type: "error"; requestId: string; error: string };

/**
 * Self-contained HTML/JS runtime booted inside a headless native WebView
 * to execute Python 3.11 via Pyodide and stream stdout + return values back.
 */
export const PYODIDE_BRIDGE_HTML = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="${PYODIDE_CDN_SCRIPT_URL}"></script>
  </head>
  <body>
    <script>
      (function () {
        var pyodideInstance = null;

        function postToNative(payload) {
          if (
            window.ReactNativeWebView &&
            typeof window.ReactNativeWebView.postMessage === "function"
          ) {
            window.ReactNativeWebView.postMessage(JSON.stringify(payload));
          }
        }

        window.__devlearnRunPython = async function (requestId, code) {
          if (!pyodideInstance) {
            postToNative({
              type: "error",
              requestId: requestId,
              error: "Native Pyodide runtime is still initializing.",
            });
            return;
          }
          try {
            var stdoutLines = [];
            pyodideInstance.setStdout({
              batched: function (chunk) {
                stdoutLines.push(String(chunk));
              },
            });
            var rawResult = await pyodideInstance.runPythonAsync(code);
            var normalizedResult = undefined;
            if (rawResult !== undefined && rawResult !== null) {
              normalizedResult =
                typeof rawResult === "object" && typeof rawResult.toJs === "function"
                  ? String(rawResult)
                  : rawResult;
            }
            postToNative({
              type: "result",
              requestId: requestId,
              stdout: stdoutLines.join("\\n"),
              result: normalizedResult,
            });
          } catch (err) {
            postToNative({
              type: "error",
              requestId: requestId,
              error: err && err.message ? err.message : String(err),
            });
          }
        };

        async function boot() {
          try {
            if (typeof window.loadPyodide !== "function") {
              throw new Error("Pyodide loader failed to download in native runtime.");
            }
            pyodideInstance = await window.loadPyodide({
              indexURL: "${PYODIDE_INDEX_URL}",
            });
            postToNative({ type: "ready" });
          } catch (err) {
            postToNative({
              type: "init_error",
              error: err && err.message ? err.message : String(err),
            });
          }
        }

        boot();
      })();
    </script>
  </body>
</html>`;

/**
 * Generates an `injectJavaScript` call to invoke a queued Python execution inside WebView.
 */
export function buildInjectedExecJs(requestId: string, code: string): string {
  const safeId = JSON.stringify(requestId);
  const safeCode = JSON.stringify(code);
  return `window.__devlearnRunPython && window.__devlearnRunPython(${safeId}, ${safeCode}); true;`;
}

export function parseBridgeMessage(raw: string): NativeBridgeMessage | null {
  if (!raw || typeof raw !== "string") return null;
  try {
    const parsed = JSON.parse(raw) as Partial<NativeBridgeMessage>;
    if (!parsed || typeof parsed.type !== "string") return null;
    if (parsed.type === "ready") {
      return { type: "ready" };
    }
    if (parsed.type === "init_error") {
      return {
        type: "init_error",
        error:
          typeof parsed.error === "string"
            ? parsed.error
            : "Failed to initialize native Python runtime.",
      };
    }
    if (parsed.type === "result" && typeof parsed.requestId === "string") {
      return {
        type: "result",
        requestId: parsed.requestId,
        stdout: typeof parsed.stdout === "string" ? parsed.stdout : "",
        result: parsed.result,
      };
    }
    if (parsed.type === "error" && typeof parsed.requestId === "string") {
      return {
        type: "error",
        requestId: parsed.requestId,
        error:
          typeof parsed.error === "string"
            ? parsed.error
            : "Native Python execution failed.",
      };
    }
    return null;
  } catch {
    return null;
  }
}
