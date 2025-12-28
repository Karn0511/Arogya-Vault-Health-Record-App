// Polyfills for browser compatibility
interface WindowWithGlobal {
  global: typeof globalThis;
  process: { env: Record<string, unknown> };
}

(window as unknown as WindowWithGlobal).global = window;
(window as unknown as WindowWithGlobal).process = (window as unknown as WindowWithGlobal).process || { env: {} };
