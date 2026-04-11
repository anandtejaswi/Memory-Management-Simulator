# Memory Management System Simulator

An interactive Operating Systems educational tool that simulates memory management algorithms in the browser. All simulation logic is implemented in C (reference) and JavaScript (runtime), with a pure HTML/CSS/JS frontend — no build step required to run.

## Features

| Module | Algorithms / Concepts |
|---|---|
| **Contiguous Allocation** | First Fit, Best Fit, Worst Fit, Next Fit |
| **Paging + TLB** | Address translation, TLB hit/miss, page fault simulation |
| **Page Replacement** | FIFO, LRU, LFU, Optimal, Clock (Second Chance) |
| **Segmentation** | Segment table, protection bits, address translation |
| **Virtual Memory** | Working Set Model, 2-Level Page Table, Inverted PT, Thrashing |
| **Analytics** | Chart.js charts, memory heatmap, CSV/PDF export |
| **Quiz Mode** | Procedural OS question generation with hints and scoring |

## Running the Simulator

Simply open `index.html` in any modern web browser:

```bash
# Quick start — no server needed
xdg-open index.html
# or
firefox index.html
# or
google-chrome index.html
```

For local development with a web server (to avoid CORS issues with ES modules in some browsers):

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Project Structure

```
memory_simulator/
├── index.html             # Single-page application entry point
├── Makefile               # WASM build (optional, requires Emscripten)
├── css/
│   ├── main.css           # CSS variables, base styles, header, tabs
│   ├── components.css     # Inputs, buttons, tables, result blocks
│   └── layout.css         # Two-column layout, responsive, analytics grid
├── js/
│   ├── main.js            # DOMContentLoaded → initController()
│   ├── controller.js      # All event handlers, orchestration
│   ├── state.js           # Global state store
│   ├── wasm_bridge.js     # WASM loader (falls back to JS automatically)
│   └── charts.js          # Chart.js wrappers
│   ├── algorithms/        # JS ports of C algorithms (one file per algo)
│   └── views/             # DOM render functions (no algorithm logic)
└── c/                     # C reference implementations
    ├── model/             # MemoryMap, Process structs
    └── algorithms/        # All algorithm C files
```

## Building WASM (Optional)

Requires [Emscripten](https://emscripten.org/) installed:

```bash
make
```

This compiles all C sources to `simulator.wasm`. The JS fallback is used automatically if the WASM file is absent.

To verify all C files compile cleanly with gcc:

```bash
make check
```

## Architecture

The project follows **MVC**:

- **Model**: C structs mirrored as plain JS objects in `js/state.js`
- **View**: `js/views/` — pure render functions, no event listeners
- **Controller**: `js/controller.js` — all event listeners, calls algorithm → view → state

## Colour Palette

The UI uses a strict white-and-purple palette:

- Primary: `#7c3aed` · Dark: `#3b0764` · Mid: `#a855f7`
- Light: `#e9d5ff` · Faint: `#f5f0ff` · White: `#ffffff`

## Algorithms Implemented

### Allocation
All four share `coalesce_free_blocks` and `split_block` helpers.

| Algorithm | Strategy | Time |
|---|---|---|
| First Fit | First block ≥ size | O(n) |
| Best Fit | Smallest block ≥ size | O(n) |
| Worst Fit | Largest block | O(n) |
| Next Fit | Resume from last position | O(n) amortised |

### Page Replacement

| Algorithm | Notes |
|---|---|
| FIFO | Circular queue; susceptible to Belady's anomaly |
| LRU | Timestamp per frame; stack algorithm |
| LFU | Frequency count; LRU tie-breaking |
| Optimal | Future knowledge; theoretical minimum |
| Clock | Reference bits; O(n) worst-case per fault |

## License

MIT
