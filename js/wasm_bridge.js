/*
 * wasm_bridge.js
 * Attempts to load the WASM module compiled from C sources.
 * If WASM is unavailable, silently falls back to the JS algorithm
 * implementations in js/algorithms/. The controller always imports
 * from the JS files directly, so no action is needed here at runtime.
 */

export const wasmAvailable = false;

export async function loadWasm() {
  /* WASM module path — only available after `make` */
  try {
    if (typeof WebAssembly === 'undefined') return false;
    /* const module = await WebAssembly.instantiateStreaming(fetch('simulator.wasm')); */
    /* wasm = module.instance.exports; */
    return false; /* WASM build not present — using JS fallback */
  } catch {
    return false;
  }
}
