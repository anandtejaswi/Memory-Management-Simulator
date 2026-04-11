/*
 * simulator.c
 * WASM export entry point. Exposes all C algorithm functions to JavaScript
 * via Emscripten when compiled with `make`. In JS-only mode this file
 * is not used; the JS ports in js/algorithms/ serve as the runtime.
 *
 * Compile with: emcc ... -s EXPORTED_FUNCTIONS='["_first_fit_allocate", ...]'
 */

#include "model/memory_model.h"
#include "model/process.h"
#include "algorithms/allocation/first_fit.h"
#include "algorithms/allocation/best_fit.h"
#include "algorithms/allocation/worst_fit.h"
#include "algorithms/allocation/next_fit.h"
#include "algorithms/page_replacement/fifo.h"
#include "algorithms/page_replacement/lru.h"
#include "algorithms/page_replacement/lfu.h"
#include "algorithms/page_replacement/optimal.h"
#include "algorithms/page_replacement/clock.h"
#include "algorithms/paging/page_table.h"
#include "algorithms/paging/tlb.h"
#include "algorithms/segmentation/segmentation.h"
#include "algorithms/virtual_memory/working_set.h"
#include "algorithms/virtual_memory/multi_level_pt.h"
#include "algorithms/virtual_memory/inverted_pt.h"
#include "algorithms/virtual_memory/thrashing.h"

/* Placeholder: all functions are exported by including the headers.
 * Emscripten will link all symbols automatically when C_SRCS is provided. */
int simulator_version(void) { return 1; }
