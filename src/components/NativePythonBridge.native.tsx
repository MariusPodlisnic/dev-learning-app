import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import WebView, {
  type WebViewMessageEvent,
  type WebViewProps,
} from "react-native-webview";
import {
  buildInjectedExecJs,
  parseBridgeMessage,
  PYODIDE_BRIDGE_HTML,
} from "../utils/nativePythonProtocol";
import {
  type NativePythonExecutionResult,
  registerNativePythonExecutor,
  setNativeBridgeState,
} from "../utils/pyodideRunner";

const EXECUTION_TIMEOUT_MS = 15000;

interface PendingExecution {
  resolve: (res: NativePythonExecutionResult) => void;
  reject: (err: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

type WebViewHandle = {
  injectJavaScript: (script: string) => void;
};

const NativeWebViewComponent =
  WebView as unknown as React.ComponentType<
    WebViewProps & { ref?: React.Ref<WebViewHandle | null> }
  >;

/**
 * Headless hidden WebView hosting Pyodide 3.11 on iOS/Android and exposing it
 * through `registerNativePythonExecutor` so Studio, Verification, Bug Hunt,
 * and Explore Sandbox run live Python natively.
 */
export default function NativePythonBridge() {
  const webViewRef = useRef<WebViewHandle | null>(null);
  const pendingRef = useRef<Map<string, PendingExecution>>(new Map());
  const requestSeqRef = useRef<number>(0);

  useEffect(() => {
    setNativeBridgeState("initializing");
    const pendingMap = pendingRef.current;

    return () => {
      registerNativePythonExecutor(null);
      setNativeBridgeState("unmounted");
      for (const [, pending] of pendingMap) {
        clearTimeout(pending.timer);
        pending.reject(new Error("Native Python bridge unmounted."));
      }
      pendingMap.clear();
    };
  }, []);

  function runPythonInWebView(
    code: string,
  ): Promise<NativePythonExecutionResult> {
    const view = webViewRef.current;
    if (!view) {
      return Promise.reject(new Error("Native Python WebView is not ready."));
    }
    requestSeqRef.current += 1;
    const requestId = `py_req_${requestSeqRef.current}`;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pendingRef.current.delete(requestId);
        reject(
          new Error(
            "Execution timed out after 15s (check for infinite loops).",
          ),
        );
      }, EXECUTION_TIMEOUT_MS);

      pendingRef.current.set(requestId, { resolve, reject, timer });
      view.injectJavaScript(buildInjectedExecJs(requestId, code));
    });
  }

  function handleMessage(event: WebViewMessageEvent) {
    const msg = parseBridgeMessage(event.nativeEvent.data);
    if (!msg) return;

    if (msg.type === "ready") {
      registerNativePythonExecutor(runPythonInWebView);
      return;
    }

    if (msg.type === "init_error") {
      setNativeBridgeState("error", msg.error);
      return;
    }

    const pending = pendingRef.current.get(msg.requestId);
    if (!pending) return;

    clearTimeout(pending.timer);
    pendingRef.current.delete(msg.requestId);

    if (msg.type === "result") {
      pending.resolve({
        stdout: msg.stdout,
        result: msg.result,
      });
    } else {
      pending.reject(new Error(msg.error));
    }
  }

  return (
    <View style={styles.hiddenContainer} pointerEvents="none">
      <NativeWebViewComponent
        ref={webViewRef}
        style={styles.hiddenWebView}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        source={{
          html: PYODIDE_BRIDGE_HTML,
          baseUrl: "https://cdn.jsdelivr.net",
        }}
        onMessage={handleMessage}
        onError={() =>
          setNativeBridgeState(
            "error",
            "Could not load Pyodide in native WebView (check internet access).",
          )
        }
        onHttpError={() =>
          setNativeBridgeState(
            "error",
            "HTTP error while fetching Pyodide WebAssembly runtime.",
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hiddenContainer: {
    position: "absolute",
    width: 0,
    height: 0,
    opacity: 0,
    overflow: "hidden",
  },
  hiddenWebView: {
    width: 1,
    height: 1,
  },
});
