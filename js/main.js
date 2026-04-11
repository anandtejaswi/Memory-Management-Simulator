/*
 * main.js
 * Application entry point. Initialises the controller on DOMContentLoaded.
 * Handles WASM bridge check (falls back to JS algorithms automatically).
 */

import { initController } from './controller.js';

document.addEventListener('DOMContentLoaded', () => {
  initController();
});
