/**
 * Web/default fallback: browsers execute Python directly through `pyodideRunner.ts`,
 * while iOS/Android automatically resolve `NativePythonBridge.native.tsx`.
 */
export default function NativePythonBridge() {
  return null;
}
