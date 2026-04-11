# Memory Management System Simulator — Complete Project Prompt (All Tiers)

---

## Project Overview

Build a complete, fully functional **Memory Management System Simulator** as an Operating Systems educational project. All simulation logic and algorithms are written in **C**, compiled to **WebAssembly** via Emscripten so the C code runs directly in the browser. The UI is a single-page web application in **HTML, CSS, and JavaScript** using a **white and purple colour palette**. The architecture follows **MVC** with separate C source files for every algorithm.

If Emscripten/WASM is not available in the build environment, implement the simulation logic as a pure **JavaScript** port of the C algorithms, keeping the same file structure and function signatures as described, with C source files included as non-compiled reference implementations.

---

## Technology Stack

- **Simulation logic**: C (C99), one `.c` file per algorithm
- **Compilation target**: WebAssembly via Emscripten (`emcc`), or pure JS fallback
- **UI**: HTML5 + CSS3 + Vanilla JavaScript (no frameworks, no libraries except Chart.js for graphs)
- **Architecture**: MVC — C/JS handles Model + logic, JS handles Controller, HTML/CSS handles View
- **Build**: Makefile for WASM build; `index.html` is the entry point

---

## Colour Palette (strict)

```css
--purple-dark:   #3b0764;
--purple-main:   #7c3aed;
--purple-mid:    #a855f7;
--purple-light:  #e9d5ff;
--purple-faint:  #f5f0ff;
--white:         #ffffff;
--off-white:     #fafafa;
--text-primary:  #1a1a2e;
--text-secondary:#4b5563;
--text-muted:    #9ca3af;
--border:        #e9d5ff;
--fault-bg:      #fdf4ff;
--fault-accent:  #7c3aed;
--hit-accent:    #6d28d9;
--danger:        #dc2626;
--success:       #059669;
```

No other colours. No gradients. No shadows heavier than `0 1px 3px rgba(124,58,237,0.08)`.

---

## Directory Structure

```
memory_simulator/
├── index.html
├── Makefile
├── README.md
│
├── css/
│   ├── main.css
│   ├── components.css
│   └── layout.css
│
├── js/
│   ├── main.js              (app entry, router, tab switching)
│   ├── controller.js        (Controller layer — dispatches actions)
│   ├── state.js             (global app state store)
│   ├── wasm_bridge.js       (loads WASM module; falls back to JS algorithms)
│   └── charts.js            (Chart.js wrappers for analytics)
│
├── js/algorithms/           (JS ports / WASM wrappers — one file per algorithm)
│   ├── allocation/
│   │   ├── first_fit.js
│   │   ├── best_fit.js
│   │   ├── worst_fit.js
│   │   └── next_fit.js
│   ├── page_replacement/
│   │   ├── fifo.js
│   │   ├── lru.js
│   │   ├── lfu.js
│   │   ├── optimal.js
│   │   └── clock.js
│   ├── paging/
│   │   ├── page_table.js
│   │   └── tlb.js
│   ├── segmentation/
│   │   └── segmentation.js
│   └── virtual_memory/
│       ├── working_set.js
│       ├── multi_level_page_table.js
│       ├── inverted_page_table.js
│       └── thrashing.js
│
├── js/views/                (View layer — render functions, no logic)
│   ├── memory_map_view.js
│   ├── page_replacement_view.js
│   ├── paging_view.js
│   ├── segmentation_view.js
│   ├── virtual_memory_view.js
│   ├── analytics_view.js
│   └── quiz_view.js
│
├── c/                       (C reference implementations, compiled to WASM)
│   ├── model/
│   │   ├── memory_model.h
│   │   ├── memory_model.c
│   │   ├── process.h
│   │   └── process.c
│   ├── algorithms/
│   │   ├── allocation/
│   │   │   ├── first_fit.h
│   │   │   ├── first_fit.c
│   │   │   ├── best_fit.h
│   │   │   ├── best_fit.c
│   │   │   ├── worst_fit.h
│   │   │   ├── worst_fit.c
│   │   │   ├── next_fit.h
│   │   │   └── next_fit.c
│   │   ├── page_replacement/
│   │   │   ├── common.h
│   │   │   ├── fifo.h
│   │   │   ├── fifo.c
│   │   │   ├── lru.h
│   │   │   ├── lru.c
│   │   │   ├── lfu.h
│   │   │   ├── lfu.c
│   │   │   ├── optimal.h
│   │   │   ├── optimal.c
│   │   │   ├── clock.h
│   │   │   └── clock.c
│   │   ├── paging/
│   │   │   ├── page_table.h
│   │   │   ├── page_table.c
│   │   │   ├── tlb.h
│   │   │   └── tlb.c
│   │   ├── segmentation/
│   │   │   ├── segmentation.h
│   │   │   └── segmentation.c
│   │   └── virtual_memory/
│   │       ├── working_set.h
│   │       ├── working_set.c
│   │       ├── multi_level_pt.h
│   │       ├── multi_level_pt.c
│   │       ├── inverted_pt.h
│   │       ├── inverted_pt.c
│   │       ├── thrashing.h
│   │       └── thrashing.c
│   └── simulator.c          (WASM export entry — exposes all C functions to JS)
```

---

## UI Layout

### Overall Structure

```
+----------------------------------------------------------+
|  Memory Management Simulator          [Header]           |
+----------------------------------------------------------+
|  [Tab Nav: Allocation | Paging | Segmentation |          |
|   Virtual Memory | Analytics | Quiz]                     |
+----------------------------------------------------------+
|                                                          |
|  [Left panel: Controls / Inputs]  [Right panel: Output]  |
|                                                          |
+----------------------------------------------------------+
```

- Header: white background, purple logo text, no decoration
- Tab navigation: underline style — active tab has `border-bottom: 2px solid var(--purple-main)` and purple text; inactive tabs are grey text
- Each tab is a full module; clicking switches the main content area
- No modals, no popovers, no tooltips
- All inputs are standard HTML `<input>`, `<select>`, `<button>`
- Tables use a plain style: purple header row, alternating off-white/white rows, no outer border
- Buttons: white background, `1px solid var(--purple-main)`, purple text; hover fills purple with white text

### Input Style Rules

```css
input[type="text"], input[type="number"], select {
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 14px;
  color: var(--text-primary);
  background: var(--white);
  outline: none;
}
input:focus, select:focus {
  border-color: var(--purple-main);
}
button {
  padding: 7px 18px;
  border: 1px solid var(--purple-main);
  border-radius: 4px;
  background: var(--white);
  color: var(--purple-main);
  font-size: 14px;
  cursor: pointer;
}
button:hover {
  background: var(--purple-main);
  color: var(--white);
}
button.primary {
  background: var(--purple-main);
  color: var(--white);
}
button.primary:hover {
  background: var(--purple-dark);
}
```

---

## MVC Architecture

### Model (C structs mirrored in JS objects)

The canonical source of truth is the C struct definitions in `c/model/`. The JS layer uses plain objects matching those shapes exactly. No class syntax in JS — use plain object literals and factory functions.

### View (`js/views/`)

Each view file exports render functions only. They receive data objects and return HTML strings or directly mutate specific DOM containers. They never call algorithm functions directly. No event listeners inside view files.

### Controller (`js/controller.js`)

All event listeners live here. On user action: reads input, calls algorithm function from `js/algorithms/`, passes result to the relevant view render function, updates `js/state.js`.

---

## C Data Structures

### `c/model/memory_model.h`

```c
#define MAX_BLOCKS   256
#define MEMORY_SIZE  1024

typedef struct {
    int id;
    int base;
    int size;
    int is_free;
    int process_id;
} MemoryBlock;

typedef struct {
    MemoryBlock blocks[MAX_BLOCKS];
    int block_count;
    int total_size;
    int last_allocated_index;
} MemoryMap;

typedef struct {
    int total_size;
    int used_size;
    int free_size;
    int external_fragmentation;
    int internal_fragmentation;
    int block_count;
    int free_block_count;
} MemoryStats;
```

### `c/model/process.h`

```c
#define MAX_PROCESSES 64

typedef struct {
    int pid;
    int size;
    int allocated_size;
    int base_address;
    int is_active;
    int segment_count;
} Process;

typedef struct {
    Process list[MAX_PROCESSES];
    int count;
    int next_pid;
} ProcessTable;
```

### `c/algorithms/paging/page_table.h`

```c
#define MAX_PAGES   512
#define MAX_FRAMES  256

typedef struct {
    int page_number;
    int frame_number;
    int valid;
    int dirty;
    int referenced;
    int access_count;
    int last_access_time;
} PageTableEntry;

typedef struct {
    PageTableEntry entries[MAX_PAGES];
    int page_count;
    int page_size;
    int fault_count;
    int access_count;
} PageTable;

typedef struct {
    int logical_address;
    int page_number;
    int offset;
    int frame_number;
    int physical_address;
    int page_fault;
    int tlb_hit;
} AddressTranslation;
```

### `c/algorithms/paging/tlb.h`

```c
#define TLB_SIZE 16

typedef struct {
    int page_number;
    int frame_number;
    int valid;
    int last_used;
} TLBEntry;

typedef struct {
    TLBEntry entries[TLB_SIZE];
    int size;
    int hits;
    int misses;
} TLB;
```

### `c/algorithms/page_replacement/common.h`

```c
#define MAX_FRAMES_PR  16
#define MAX_REF_STRING 512

typedef struct {
    int frames[MAX_FRAMES_PR];
    int frame_count;
    int ref_string[MAX_REF_STRING];
    int ref_length;
} PRInput;

typedef struct {
    int step;
    int page;
    int frames_snapshot[MAX_FRAMES_PR];
    int page_fault;
    int victim_page;
    int ref_bit_snapshot[MAX_FRAMES_PR]; /* for Clock algorithm */
} PRStep;

typedef struct {
    PRStep steps[MAX_REF_STRING];
    int step_count;
    int total_faults;
    int total_hits;
    char algorithm_name[32];
} PRResult;
```

### `c/algorithms/segmentation/segmentation.h`

```c
#define MAX_SEGMENTS 32

typedef struct {
    int segment_id;
    int base;
    int limit;
    int read;
    int write;
    int execute;
    int process_id;
    char name[16]; /* e.g. "code", "stack", "heap" */
} Segment;

typedef struct {
    Segment segments[MAX_SEGMENTS];
    int count;
    int process_id;
} SegmentTable;

typedef struct {
    int logical_address;    /* segment_number * 10000 + offset */
    int segment_number;
    int offset;
    int physical_address;
    int fault;              /* 1 = segmentation fault */
    int protection_fault;   /* 1 = permission denied */
    char fault_reason[64];
} SegmentTranslation;
```

### `c/algorithms/virtual_memory/working_set.h`

```c
#define MAX_WS_HISTORY 1024

typedef struct {
    int window_size;
    int ref_string[MAX_REF_STRING];
    int ref_length;
} WSInput;

typedef struct {
    int time_step;
    int page;
    int working_set[MAX_PAGES];
    int ws_size;
    int page_fault;
} WSStep;

typedef struct {
    WSStep steps[MAX_WS_HISTORY];
    int step_count;
    int total_faults;
    int max_ws_size;
    float avg_ws_size;
} WSResult;
```

### `c/algorithms/virtual_memory/multi_level_pt.h`

```c
/* 2-level page table */
#define L1_BITS  10
#define L2_BITS  10
#define OFFSET_BITS 12  /* 4KB pages */

typedef struct {
    int frame_number;
    int valid;
} L2Entry;

typedef struct {
    L2Entry *table;  /* pointer to L2 table, NULL if not present */
    int present;
} L1Entry;

typedef struct {
    L1Entry l1[1024];  /* 2^10 */
    int page_size;
    int fault_count;
} TwoLevelPageTable;

typedef struct {
    int virtual_address;
    int l1_index;
    int l2_index;
    int offset;
    int physical_address;
    int fault;
    int levels_walked;
} MLTranslation;
```

### `c/algorithms/virtual_memory/inverted_pt.h`

```c
#define MAX_PHYSICAL_FRAMES 256

typedef struct {
    int pid;
    int page_number;
    int valid;
} InvertedEntry;

typedef struct {
    InvertedEntry table[MAX_PHYSICAL_FRAMES];
    int frame_count;
} InvertedPageTable;

typedef struct {
    int pid;
    int page_number;
    int frame_number;   /* -1 if not found */
    int physical_address;
    int fault;
    int search_steps;   /* how many entries were scanned */
} InvertedTranslation;
```

### `c/algorithms/virtual_memory/thrashing.h`

```c
typedef struct {
    int process_count;
    int frames_per_process[MAX_PROCESSES];
    int working_set_sizes[MAX_PROCESSES];
    int total_frames;
} ThrashingInput;

typedef struct {
    int time_step;
    int cpu_utilization;     /* 0-100 */
    int thrashing;           /* 1 if detected */
    int active_processes;
    int total_page_faults;
} ThrashingStep;

typedef struct {
    ThrashingStep steps[256];
    int step_count;
    int thrashing_onset_step;  /* -1 if never */
    int peak_fault_rate;
} ThrashingResult;
```

---

## C Algorithm Implementations

### Allocation Algorithms

All four allocation algorithm `.c` files share these internal helpers (define them as `static` in each file):

```c
/* Merges adjacent free blocks after any free operation */
static void coalesce_free_blocks(MemoryMap *map);

/* Splits block at index into [size] + [remainder free block] */
static void split_block(MemoryMap *map, int index, int size);
```

**`c/algorithms/allocation/first_fit.c`**
```c
/*
 * first_fit.c
 * First Fit allocation: scan from index 0 and allocate the first
 * free block >= requested size. O(n) per allocation.
 * Fast but causes clustering of small fragments at low addresses.
 */
int first_fit_allocate(MemoryMap *map, int process_id, int size);
void first_fit_free(MemoryMap *map, int process_id);
MemoryStats first_fit_stats(MemoryMap *map);
```

**`c/algorithms/allocation/best_fit.c`**
```c
/*
 * best_fit.c
 * Best Fit allocation: scan entire list, pick smallest block >= size.
 * O(n) per allocation. Minimises wasted space per allocation but
 * produces many tiny unusable fragments over time.
 */
int best_fit_allocate(MemoryMap *map, int process_id, int size);
void best_fit_free(MemoryMap *map, int process_id);
MemoryStats best_fit_stats(MemoryMap *map);
```

**`c/algorithms/allocation/worst_fit.c`**
```c
/*
 * worst_fit.c
 * Worst Fit allocation: pick the largest free block.
 * O(n) per allocation. Leaves large remainders that are more reusable
 * but wastes large blocks on small requests.
 */
int worst_fit_allocate(MemoryMap *map, int process_id, int size);
void worst_fit_free(MemoryMap *map, int process_id);
MemoryStats worst_fit_stats(MemoryMap *map);
```

**`c/algorithms/allocation/next_fit.c`**
```c
/*
 * next_fit.c
 * Next Fit allocation: like First Fit but resumes scanning from
 * where the last allocation ended (stored in map->last_allocated_index).
 * Distributes allocations more evenly across memory.
 */
int next_fit_allocate(MemoryMap *map, int process_id, int size);
void next_fit_free(MemoryMap *map, int process_id);
MemoryStats next_fit_stats(MemoryMap *map);
```

---

### Page Replacement Algorithms

All five return `PRResult` from `PRInput`. No I/O inside algorithm files.

**`c/algorithms/page_replacement/fifo.c`**
```c
/*
 * fifo.c
 * FIFO page replacement: maintains a circular queue of loaded pages.
 * Evicts the oldest page (first in). O(1) per reference after init.
 * Suffers from Belady's anomaly: more frames can cause more faults.
 */
PRResult fifo_simulate(PRInput input);

/* Also provide a Belady's anomaly check function */
int fifo_check_beladys(PRInput input, int min_frames, int max_frames);
/* Returns 1 if Belady's anomaly is detected across the frame range */
```

**`c/algorithms/page_replacement/lru.c`**
```c
/*
 * lru.c
 * LRU page replacement: evicts the page whose last use was furthest
 * in the past. Tracks last-use timestamps per frame. O(n) per fault.
 * Does not exhibit Belady's anomaly. Stack algorithm.
 */
PRResult lru_simulate(PRInput input);
```

**`c/algorithms/page_replacement/lfu.c`**
```c
/*
 * lfu.c
 * LFU page replacement: evicts the page with the lowest access count.
 * Ties broken by LRU among equal-frequency pages.
 * Can retain old frequently-used pages that are no longer needed.
 */
PRResult lfu_simulate(PRInput input);
```

**`c/algorithms/page_replacement/optimal.c`**
```c
/*
 * optimal.c
 * Optimal (Belady's Min) replacement: evicts the page whose next
 * use is furthest in the future. Requires full reference string
 * known in advance. Theoretical lower bound on page faults.
 */
PRResult optimal_simulate(PRInput input);
```

**`c/algorithms/page_replacement/clock.c`**
```c
/*
 * clock.c
 * Clock (Second Chance) replacement: circular buffer with reference
 * bits. On fault, scan clockwise: if ref=1 clear and advance;
 * if ref=0 evict. Stores ref_bit_snapshot per step for visualisation.
 */
PRResult clock_simulate(PRInput input);
```

---

### Paging

**`c/algorithms/paging/page_table.c`**
```c
void page_table_init(PageTable *pt, int page_size, int num_pages);
AddressTranslation translate_address(PageTable *pt, TLB *tlb, int logical_address);
void load_page(PageTable *pt, int page_number, int frame_number);
void invalidate_page(PageTable *pt, int page_number);
```

**`c/algorithms/paging/tlb.c`**
```c
void tlb_init(TLB *tlb);
int  tlb_lookup(TLB *tlb, int page_number, int *frame_number);
void tlb_insert(TLB *tlb, int page_number, int frame_number);
void tlb_flush(TLB *tlb);
float tlb_hit_ratio(TLB *tlb);
```

---

### Segmentation

**`c/algorithms/segmentation/segmentation.c`**
```c
/*
 * segmentation.c
 * Logical address space divided into named segments (code, stack, heap,
 * data, shared). Each segment has a base address and a limit. The segment
 * table stores base, limit, and protection bits (R/W/X) per segment.
 * A logical address = (segment_number, offset). A fault occurs if offset
 * >= limit or the operation violates protection bits.
 */
void segmentation_init(SegmentTable *st, int process_id);
int  segmentation_add_segment(SegmentTable *st, int base, int limit,
                               int read, int write, int execute,
                               const char *name);
SegmentTranslation segmentation_translate(SegmentTable *st,
                                          int segment_number,
                                          int offset,
                                          int operation); /* 0=read,1=write,2=exec */
void segmentation_remove_segment(SegmentTable *st, int segment_id);
```

---

### Virtual Memory — Working Set

**`c/algorithms/virtual_memory/working_set.c`**
```c
/*
 * working_set.c
 * The working set W(t, delta) is the set of pages referenced in the
 * last 'delta' time units (window size). A process is resident only
 * if all pages in its working set are in memory. Tracks working set
 * size over time and reports locality changes.
 */
WSResult working_set_simulate(WSInput input);
```

---

### Virtual Memory — Multi-level Page Table

**`c/algorithms/virtual_memory/multi_level_pt.c`**
```c
/*
 * multi_level_pt.c
 * 2-level page table splitting a 32-bit virtual address into:
 * [L1 index: 10 bits][L2 index: 10 bits][Offset: 12 bits]
 * L1 table is always resident; L2 tables are created on demand.
 * Saves memory vs a single flat page table for sparse address spaces.
 */
void ml_pt_init(TwoLevelPageTable *pt);
MLTranslation ml_pt_translate(TwoLevelPageTable *pt, int virtual_address);
void ml_pt_map_page(TwoLevelPageTable *pt, int virtual_address,
                    int frame_number);
int  ml_pt_get_memory_overhead(TwoLevelPageTable *pt);
/* Returns bytes used by page table structures */
```

---

### Virtual Memory — Inverted Page Table

**`c/algorithms/virtual_memory/inverted_pt.c`**
```c
/*
 * inverted_pt.c
 * One entry per physical frame (not per virtual page). Each entry
 * stores (pid, page_number). To translate, search the table for
 * the matching (pid, page) pair. O(n) linear search by default.
 * Memory usage is proportional to physical memory, not virtual.
 */
void ipt_init(InvertedPageTable *ipt, int frame_count);
InvertedTranslation ipt_translate(InvertedPageTable *ipt,
                                   int pid, int page_number,
                                   int offset);
void ipt_load_page(InvertedPageTable *ipt, int frame, int pid,
                   int page_number);
void ipt_free_process(InvertedPageTable *ipt, int pid);
```

---

### Virtual Memory — Thrashing

**`c/algorithms/virtual_memory/thrashing.c`**
```c
/*
 * thrashing.c
 * Models thrashing by simulating N processes each with a working set
 * larger than their allocated frames. As more processes are added,
 * the sum of working sets exceeds total frames, causing CPU utilisation
 * to collapse as all time is spent handling page faults.
 * Reports CPU utilisation and fault rate at each time step.
 */
ThrashingResult thrashing_simulate(ThrashingInput input);
int thrashing_detect(ThrashingResult *result);
/* Returns the time step at which thrashing onset is detected, or -1 */
```

---

## JavaScript Algorithm Ports (`js/algorithms/`)

Each JS file mirrors its C counterpart exactly. It exports one or more functions with identical signatures translated to JS:

```js
// js/algorithms/page_replacement/fifo.js
export function fifoSimulate(input) {
  // input: { frames: [...], refString: [...] }
  // returns: { steps: [...], totalFaults, totalHits, algorithmName }
}
export function fifoCheckBeladys(input, minFrames, maxFrames) { ... }
```

All JS algorithm files must:
- Use no external libraries
- Use plain loops and arrays (no map/filter/reduce for the core algorithm logic — keep it readable and close to the C source)
- Include a top comment block matching the C file's description
- Export functions as ES modules

---

## HTML Structure (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Memory Management Simulator</title>
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/layout.css">
</head>
<body>
  <header>
    <h1>Memory Management Simulator</h1>
    <p>Operating Systems — Interactive Learning Tool</p>
  </header>

  <nav id="tab-nav">
    <button class="tab active" data-tab="allocation">Allocation</button>
    <button class="tab" data-tab="paging">Paging</button>
    <button class="tab" data-tab="segmentation">Segmentation</button>
    <button class="tab" data-tab="virtual">Virtual Memory</button>
    <button class="tab" data-tab="analytics">Analytics</button>
    <button class="tab" data-tab="quiz">Quiz</button>
  </nav>

  <main id="app">

    <!-- Tab 1: Contiguous Allocation -->
    <section id="tab-allocation" class="tab-content active">
      <div class="two-col">
        <div class="panel-left">
          <h2>Contiguous Memory Allocation</h2>
          <label>Algorithm</label>
          <select id="alloc-algo">
            <option value="first_fit">First Fit</option>
            <option value="best_fit">Best Fit</option>
            <option value="worst_fit">Worst Fit</option>
            <option value="next_fit">Next Fit</option>
          </select>
          <label>Total Memory (KB)</label>
          <input type="number" id="alloc-mem-size" value="1024" min="64" max="8192">
          <label>Process Size (KB)</label>
          <input type="number" id="alloc-proc-size" value="128" min="1">
          <div class="btn-row">
            <button class="primary" id="btn-alloc-add">Allocate</button>
            <button id="btn-alloc-free">Free Process</button>
            <button id="btn-alloc-compact">Compact</button>
            <button id="btn-alloc-reset">Reset</button>
          </div>
          <label>Free PID</label>
          <input type="number" id="alloc-free-pid" min="1">
          <button id="btn-compare-alloc">Compare All Algorithms</button>
        </div>
        <div class="panel-right">
          <div id="alloc-memory-map"></div>
          <div id="alloc-stats-table"></div>
          <div id="alloc-comparison-table"></div>
        </div>
      </div>
    </section>

    <!-- Tab 2: Paging + TLB + Page Replacement -->
    <section id="tab-paging" class="tab-content">
      <div class="two-col">
        <div class="panel-left">
          <h2>Paging</h2>
          <label>Page Size (bytes)</label>
          <select id="page-size">
            <option value="512">512 B</option>
            <option value="1024">1 KB</option>
            <option value="4096" selected>4 KB</option>
            <option value="8192">8 KB</option>
          </select>
          <label>Number of Pages</label>
          <input type="number" id="page-count" value="16" min="2" max="512">
          <label>Logical Address (decimal)</label>
          <input type="number" id="page-logical-addr" value="0" min="0">
          <div class="btn-row">
            <button class="primary" id="btn-translate">Translate</button>
            <button id="btn-flush-tlb">Flush TLB</button>
          </div>
          <h3 style="margin-top:20px">Page Replacement</h3>
          <label>Algorithm</label>
          <select id="pr-algo">
            <option value="fifo">FIFO</option>
            <option value="lru">LRU</option>
            <option value="lfu">LFU</option>
            <option value="optimal">Optimal</option>
            <option value="clock">Clock</option>
          </select>
          <label>Number of Frames</label>
          <input type="number" id="pr-frames" value="3" min="1" max="16">
          <label>Reference String (space-separated)</label>
          <input type="text" id="pr-ref-string" value="7 0 1 2 0 3 0 4 2 3 0 3 2">
          <div class="btn-row">
            <button class="primary" id="btn-pr-run">Run</button>
            <button id="btn-pr-compare">Compare All</button>
            <button id="btn-pr-beladys">Check Belady's</button>
          </div>
        </div>
        <div class="panel-right">
          <div id="paging-translation-result"></div>
          <div id="paging-page-table"></div>
          <div id="paging-tlb"></div>
          <div id="pr-trace-table"></div>
          <div id="pr-comparison-table"></div>
          <div id="pr-beladys-result"></div>
        </div>
      </div>
    </section>

    <!-- Tab 3: Segmentation -->
    <section id="tab-segmentation" class="tab-content">
      <div class="two-col">
        <div class="panel-left">
          <h2>Segmentation</h2>
          <label>Process ID</label>
          <input type="number" id="seg-pid" value="1" min="1">
          <label>Segment Name</label>
          <input type="text" id="seg-name" value="code">
          <label>Base Address</label>
          <input type="number" id="seg-base" value="0" min="0">
          <label>Limit (size)</label>
          <input type="number" id="seg-limit" value="512" min="1">
          <label>Permissions</label>
          <div class="checkbox-row">
            <label><input type="checkbox" id="seg-read" checked> Read</label>
            <label><input type="checkbox" id="seg-write"> Write</label>
            <label><input type="checkbox" id="seg-exec" checked> Execute</label>
          </div>
          <button class="primary" id="btn-seg-add">Add Segment</button>
          <h3 style="margin-top:16px">Translate Address</h3>
          <label>Segment Number</label>
          <input type="number" id="seg-trans-seg" value="0" min="0">
          <label>Offset</label>
          <input type="number" id="seg-trans-offset" value="100" min="0">
          <label>Operation</label>
          <select id="seg-trans-op">
            <option value="0">Read</option>
            <option value="1">Write</option>
            <option value="2">Execute</option>
          </select>
          <button class="primary" id="btn-seg-translate">Translate</button>
          <button id="btn-seg-reset">Reset</button>
        </div>
        <div class="panel-right">
          <div id="seg-table"></div>
          <div id="seg-translation-result"></div>
          <div id="seg-memory-map"></div>
        </div>
      </div>
    </section>

    <!-- Tab 4: Virtual Memory -->
    <section id="tab-virtual" class="tab-content">
      <div class="two-col">
        <div class="panel-left">
          <h2>Virtual Memory</h2>
          <label>Sub-module</label>
          <select id="vm-submodule">
            <option value="working_set">Working Set Model</option>
            <option value="multilevel">2-Level Page Table</option>
            <option value="inverted">Inverted Page Table</option>
            <option value="thrashing">Thrashing Simulation</option>
          </select>

          <!-- Working Set inputs -->
          <div id="vm-ws-inputs">
            <label>Window Size (delta)</label>
            <input type="number" id="ws-window" value="3" min="1" max="20">
            <label>Reference String</label>
            <input type="text" id="ws-ref-string" value="1 2 3 4 2 1 5 6 2 1 2 3 7 6 3 2 1">
            <button class="primary" id="btn-ws-run">Run</button>
          </div>

          <!-- Multi-level PT inputs -->
          <div id="vm-ml-inputs" style="display:none">
            <label>Virtual Address (decimal)</label>
            <input type="number" id="ml-vaddr" value="4096" min="0">
            <label>Map to Frame</label>
            <input type="number" id="ml-frame" value="7" min="0">
            <div class="btn-row">
              <button class="primary" id="btn-ml-map">Map Page</button>
              <button id="btn-ml-translate">Translate</button>
            </div>
          </div>

          <!-- Inverted PT inputs -->
          <div id="vm-ipt-inputs" style="display:none">
            <label>PID</label>
            <input type="number" id="ipt-pid" value="1" min="1">
            <label>Page Number</label>
            <input type="number" id="ipt-page" value="0" min="0">
            <label>Offset</label>
            <input type="number" id="ipt-offset" value="0" min="0">
            <div class="btn-row">
              <button id="btn-ipt-load">Load Page</button>
              <button class="primary" id="btn-ipt-translate">Translate</button>
            </div>
          </div>

          <!-- Thrashing inputs -->
          <div id="vm-thrash-inputs" style="display:none">
            <label>Total Physical Frames</label>
            <input type="number" id="thrash-frames" value="32" min="4" max="256">
            <label>Process Count</label>
            <input type="number" id="thrash-procs" value="4" min="1" max="16">
            <label>Working Set Size per Process (KB)</label>
            <input type="number" id="thrash-ws-size" value="10" min="1">
            <button class="primary" id="btn-thrash-run">Simulate</button>
          </div>
        </div>
        <div class="panel-right">
          <div id="vm-output"></div>
        </div>
      </div>
    </section>

    <!-- Tab 5: Analytics -->
    <section id="tab-analytics" class="tab-content">
      <h2>Analytics Dashboard</h2>
      <div id="analytics-controls">
        <button id="btn-export-csv">Export CSV</button>
        <button id="btn-export-pdf">Export PDF</button>
        <button id="btn-clear-history">Clear History</button>
      </div>
      <div id="analytics-charts">
        <div class="chart-container">
          <h3>Memory Utilisation Over Time</h3>
          <canvas id="chart-utilisation"></canvas>
        </div>
        <div class="chart-container">
          <h3>Page Fault Rate by Algorithm</h3>
          <canvas id="chart-faults"></canvas>
        </div>
        <div class="chart-container">
          <h3>Fragmentation Index History</h3>
          <canvas id="chart-fragmentation"></canvas>
        </div>
        <div class="chart-container">
          <h3>TLB Hit Ratio Over Time</h3>
          <canvas id="chart-tlb"></canvas>
        </div>
      </div>
      <div id="analytics-heatmap">
        <h3>Memory Access Heatmap</h3>
        <div id="heatmap-canvas"></div>
      </div>
    </section>

    <!-- Tab 6: Quiz -->
    <section id="tab-quiz" class="tab-content">
      <h2>Quiz Mode</h2>
      <div id="quiz-setup">
        <label>Topic</label>
        <select id="quiz-topic">
          <option value="page_replacement">Page Replacement</option>
          <option value="allocation">Memory Allocation</option>
          <option value="segmentation">Segmentation</option>
          <option value="virtual">Virtual Memory</option>
        </select>
        <label>Difficulty</label>
        <select id="quiz-difficulty">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button class="primary" id="btn-quiz-start">Start Quiz</button>
      </div>
      <div id="quiz-question" style="display:none">
        <div id="quiz-scenario"></div>
        <div id="quiz-prompt"></div>
        <input type="text" id="quiz-answer" placeholder="Your answer">
        <div class="btn-row">
          <button class="primary" id="btn-quiz-submit">Submit</button>
          <button id="btn-quiz-hint">Hint</button>
        </div>
        <div id="quiz-feedback"></div>
        <button id="btn-quiz-next" style="display:none">Next Question</button>
      </div>
      <div id="quiz-score"></div>
    </section>

  </main>

  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script type="module" src="js/main.js"></script>
</body>
</html>
```

---

## CSS Specifications

### `css/main.css`
```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --purple-dark:    #3b0764;
  --purple-main:    #7c3aed;
  --purple-mid:     #a855f7;
  --purple-light:   #e9d5ff;
  --purple-faint:   #f5f0ff;
  --white:          #ffffff;
  --off-white:      #fafafa;
  --text-primary:   #1a1a2e;
  --text-secondary: #4b5563;
  --text-muted:     #9ca3af;
  --border:         #e9d5ff;
  --danger:         #dc2626;
  --success:        #059669;
}

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  font-size: 14px;
  color: var(--text-primary);
  background: var(--off-white);
  line-height: 1.5;
}

header {
  background: var(--white);
  border-bottom: 1px solid var(--border);
  padding: 16px 32px;
}

header h1 {
  font-size: 20px;
  font-weight: 600;
  color: var(--purple-main);
}

header p {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}

#tab-nav {
  background: var(--white);
  border-bottom: 1px solid var(--border);
  padding: 0 32px;
  display: flex;
  gap: 0;
}

.tab {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 12px 20px;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 0;
}

.tab:hover { color: var(--purple-main); }

.tab.active {
  color: var(--purple-main);
  border-bottom: 2px solid var(--purple-main);
  font-weight: 500;
}

main { padding: 24px 32px; }

.tab-content { display: none; }
.tab-content.active { display: block; }
```

### `css/components.css`

```css
/* Inputs */
label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin: 12px 0 4px;
}

input[type="text"],
input[type="number"],
select {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 7px 10px;
  font-size: 14px;
  color: var(--text-primary);
  background: var(--white);
  outline: none;
}

input:focus, select:focus {
  border-color: var(--purple-main);
}

/* Buttons */
button {
  padding: 7px 16px;
  border: 1px solid var(--purple-main);
  border-radius: 4px;
  background: var(--white);
  color: var(--purple-main);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

button:hover {
  background: var(--purple-main);
  color: var(--white);
}

button.primary {
  background: var(--purple-main);
  color: var(--white);
}

button.primary:hover {
  background: var(--purple-dark);
  border-color: var(--purple-dark);
}

.btn-row {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.checkbox-row {
  display: flex;
  gap: 16px;
  margin-top: 6px;
}

.checkbox-row label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  font-size: 13px;
  color: var(--text-primary);
  cursor: pointer;
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin-top: 12px;
}

thead tr {
  background: var(--purple-main);
  color: var(--white);
}

thead th {
  padding: 8px 12px;
  text-align: left;
  font-weight: 500;
}

tbody tr:nth-child(even) { background: var(--purple-faint); }
tbody tr:nth-child(odd)  { background: var(--white); }

tbody td {
  padding: 7px 12px;
  color: var(--text-primary);
}

/* Fault rows in page replacement table */
tr.fault td {
  color: var(--purple-main);
  font-weight: 500;
  background: var(--purple-faint);
}

/* Memory map bar */
.memory-map-bar {
  display: flex;
  width: 100%;
  height: 44px;
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 12px;
}

.mem-block {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  overflow: hidden;
  white-space: nowrap;
  border-right: 1px solid var(--border);
  transition: flex 0.3s ease;
}

.mem-block:last-child { border-right: none; }

.mem-block.free {
  background: var(--off-white);
  color: var(--text-muted);
}

.mem-block.allocated {
  background: var(--purple-faint);
  color: var(--purple-main);
  font-weight: 500;
}

/* Stats row */
.stats-row {
  display: flex;
  gap: 16px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.stat-item {
  font-size: 13px;
  color: var(--text-secondary);
}

.stat-item span {
  font-weight: 600;
  color: var(--purple-main);
}

/* Section headers */
h2 {
  font-size: 16px;
  font-weight: 600;
  color: var(--purple-dark);
  margin-bottom: 16px;
}

h3 {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
}

/* Result / feedback blocks */
.result-block {
  margin-top: 16px;
  padding: 12px 16px;
  border-left: 3px solid var(--purple-main);
  background: var(--purple-faint);
  font-size: 13px;
  color: var(--text-primary);
}

.result-block.error {
  border-left-color: var(--danger);
  background: #fff5f5;
  color: var(--danger);
}

.result-block.success {
  border-left-color: var(--success);
  background: #f0fdf4;
  color: #065f46;
}

/* Chart containers */
.chart-container {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
}

/* Analytics controls */
#analytics-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

/* Heatmap cells */
.heatmap-grid {
  display: grid;
  gap: 2px;
  margin-top: 8px;
}

.heatmap-cell {
  width: 18px;
  height: 18px;
  border-radius: 2px;
  background: var(--purple-faint);
}

/* Quiz */
#quiz-setup { max-width: 360px; }
#quiz-question { max-width: 600px; margin-top: 20px; }
#quiz-scenario {
  background: var(--purple-faint);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 14px;
  font-family: monospace;
  font-size: 13px;
  color: var(--text-primary);
  margin-bottom: 12px;
}
#quiz-prompt { font-size: 15px; font-weight: 500; margin-bottom: 12px; }
#quiz-feedback { margin-top: 12px; }
#quiz-score {
  margin-top: 20px;
  font-size: 15px;
  font-weight: 500;
  color: var(--purple-main);
}
```

### `css/layout.css`

```css
.two-col {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
  align-items: start;
}

.panel-left {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 20px;
  position: sticky;
  top: 16px;
}

.panel-right {
  min-width: 0;
}

@media (max-width: 768px) {
  .two-col { grid-template-columns: 1fr; }
  .panel-left { position: static; }
  main { padding: 16px; }
  #tab-nav { padding: 0 16px; overflow-x: auto; }
}
```

---

## JavaScript Controller (`js/controller.js`)

Implement event listeners and orchestration for all six modules:

```js
// controller.js
import { fifoSimulate, fifoCheckBeladys } from './algorithms/page_replacement/fifo.js';
import { lruSimulate }     from './algorithms/page_replacement/lru.js';
import { lfuSimulate }     from './algorithms/page_replacement/lfu.js';
import { optimalSimulate } from './algorithms/page_replacement/optimal.js';
import { clockSimulate }   from './algorithms/page_replacement/clock.js';
import { firstFitAllocate, firstFitFree }  from './algorithms/allocation/first_fit.js';
import { bestFitAllocate,  bestFitFree  }  from './algorithms/allocation/best_fit.js';
import { worstFitAllocate, worstFitFree }  from './algorithms/allocation/worst_fit.js';
import { nextFitAllocate,  nextFitFree  }  from './algorithms/allocation/next_fit.js';
import { pageTableInit, translateAddress } from './algorithms/paging/page_table.js';
import { tlbInit, tlbFlush, tlbHitRatio }  from './algorithms/paging/tlb.js';
import { segmentationInit, segmentationAddSegment,
         segmentationTranslate }           from './algorithms/segmentation/segmentation.js';
import { workingSetSimulate }              from './algorithms/virtual_memory/working_set.js';
import { mlPtInit, mlPtMap, mlPtTranslate } from './algorithms/virtual_memory/multi_level_page_table.js';
import { iptInit, iptLoad, iptTranslate }  from './algorithms/virtual_memory/inverted_page_table.js';
import { thrashingSimulate }               from './algorithms/virtual_memory/thrashing.js';
import * as MemMapView  from './views/memory_map_view.js';
import * as PRView      from './views/page_replacement_view.js';
import * as PagingView  from './views/paging_view.js';
import * as SegView     from './views/segmentation_view.js';
import * as VMView      from './views/virtual_memory_view.js';
import * as Analytics   from './views/analytics_view.js';
import * as Quiz        from './views/quiz_view.js';
import { state }        from './state.js';

export function initController() {
  initTabNav();
  initAllocationModule();
  initPagingModule();
  initSegmentationModule();
  initVirtualMemoryModule();
  initAnalyticsModule();
  initQuizModule();
}
```

All event handlers must:
1. Read input values from the DOM
2. Validate inputs (show error result-block if invalid)
3. Call algorithm function
4. Pass result to view render function
5. Record event in `state.history` for analytics

---

## Analytics Module (`js/views/analytics_view.js`)

Uses Chart.js to render four charts and one heatmap. Charts update reactively as the user interacts with other modules:

- **Memory utilisation line chart**: x = action number, y = % used. One line per active algorithm session.
- **Page fault rate bar chart**: grouped bars per algorithm for current reference string.
- **Fragmentation index line chart**: tracks external fragmentation % over each allocation action.
- **TLB hit ratio line chart**: updates after each address translation.
- **Access heatmap**: grid of cells, each cell = a memory page. Cell colour intensity = access frequency (lightest purple = 0 accesses, darkest purple = max accesses). Rendered as a CSS grid of divs.

Export functions:
```js
export function exportCSV(state);
// Generates a CSV with all simulation history and downloads it

export function exportPDF(state);
// Uses window.print() with a print-specific CSS that hides nav and shows only data tables
```

---

## Quiz Module (`js/views/quiz_view.js`)

Generates procedural questions by running a simulation with a random reference string, then asking the student to predict an outcome. Examples:

**Page replacement question (medium)**:
```
Reference string: 1 2 3 4 1 2 5 1 2 3 4 5
Frames: 3  |  Algorithm: FIFO

After processing the first 6 references, what pages are currently in the 3 frames?
Answer: [input box]
```

**Allocation question (hard)**:
```
Memory: 1024 KB, 4 processes allocated:
P1=200KB, P2=100KB, P3=300KB, P4=150KB

P2 is freed, then P3 is freed.
Using Best Fit, can a process of 380KB be allocated? (yes/no)
What is the external fragmentation after allocation? (KB)
```

Quiz engine:
```js
function generateQuestion(topic, difficulty) {
  // Runs the relevant algorithm on random input
  // Picks a question type appropriate to the topic/difficulty
  // Returns { scenario, prompt, correctAnswer, hint, explanation }
}

function checkAnswer(userAnswer, correctAnswer, topic) {
  // Normalises and compares (handles "yes/no", numbers, page sets)
  // Returns { correct: bool, explanation: string }
}
```

Score is tracked in session as `{ correct: N, total: N }`. Display both after each answer and cumulatively.

---

## State Management (`js/state.js`)

```js
export const state = {
  // Allocation
  memoryMap: null,
  processTable: { list: [], count: 0, nextPid: 1 },
  allocationHistory: [],   // [{ action, algorithm, stats }]

  // Paging
  pageTable: null,
  tlb: null,
  translationHistory: [],  // [AddressTranslation]

  // Page replacement
  prHistory: [],           // [PRResult]

  // Segmentation
  segmentTable: null,
  segTranslationHistory: [],

  // Virtual memory
  wsResult: null,
  mlPageTable: null,
  invertedPageTable: null,
  thrashingResult: null,

  // Analytics
  utilizationTimeline: [],      // [{ t, value }]
  fragmentationTimeline: [],
  tlbRatioTimeline: [],
  accessFrequency: {},           // { pageNumber: count }

  // Quiz
  quizSession: { correct: 0, total: 0, questions: [] }
};
```

---

## Implementation Order

1. All C header files in `c/`
2. All C implementation files in `c/`
3. `index.html` (complete, with all tab sections)
4. `css/main.css`, `css/components.css`, `css/layout.css`
5. `js/state.js`
6. All JS algorithm files in `js/algorithms/` (port from C)
7. All JS view files in `js/views/`
8. `js/charts.js`
9. `js/controller.js`
10. `js/main.js`
11. `Makefile`
12. `README.md`

---

## Coding Standards

- Every C file starts with a block comment: file name, algorithm name, description (3–5 sentences), time complexity.
- Every JS algorithm file starts with the same block comment translated to JS `/* */` format.
- No `malloc` in C — static arrays with `#define` limits only.
- No external JS libraries except Chart.js (loaded from CDN).
- No inline `style=""` attributes in HTML except `display:none` for toggled sections.
- All user input validated before being passed to algorithms; invalid input shows a `.result-block.error` message.
- All numbers displayed in tables rounded to 2 decimal places where fractional.
- No `console.log` left in production code.

---

## Deliverables

Generate every file completely — no placeholders, no `// TODO`, no truncations. Every C file must compile cleanly under `gcc -Wall -Wextra -std=c99`. Every JS file must be valid ES module syntax. The simulator must run by opening `index.html` in a browser with no build step required (JS-only mode; WASM build is optional via `make`).

Deliver files in the implementation order listed above.