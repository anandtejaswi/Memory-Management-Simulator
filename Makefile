# Memory Management System Simulator — Makefile
# Builds C reference implementations to WebAssembly using Emscripten.
# Run `make` to build WASM. Run `make check` to verify C with gcc.
# The simulator runs without WASM build (JS-only mode) via index.html.

CC      = gcc
EMCC    = emcc
CFLAGS  = -Wall -Wextra -std=c99 -Ic/model -Ic/algorithms

# All C source files
C_SRCS  = \
	c/model/memory_model.c \
	c/model/process.c \
	c/algorithms/allocation/first_fit.c \
	c/algorithms/allocation/best_fit.c \
	c/algorithms/allocation/worst_fit.c \
	c/algorithms/allocation/next_fit.c \
	c/algorithms/page_replacement/fifo.c \
	c/algorithms/page_replacement/lru.c \
	c/algorithms/page_replacement/lfu.c \
	c/algorithms/page_replacement/optimal.c \
	c/algorithms/page_replacement/clock.c \
	c/algorithms/paging/page_table.c \
	c/algorithms/paging/tlb.c \
	c/algorithms/segmentation/segmentation.c \
	c/algorithms/virtual_memory/working_set.c \
	c/algorithms/virtual_memory/multi_level_pt.c \
	c/algorithms/virtual_memory/inverted_pt.c \
	c/algorithms/virtual_memory/thrashing.c \
	c/simulator.c

WASM_OUT = simulator.wasm

.PHONY: all check clean

all: $(WASM_OUT)

$(WASM_OUT): $(C_SRCS)
	$(EMCC) $(C_SRCS) \
		-Ic/model \
		-Ic/algorithms/allocation \
		-Ic/algorithms/page_replacement \
		-Ic/algorithms/paging \
		-Ic/algorithms/segmentation \
		-Ic/algorithms/virtual_memory \
		-o simulator.wasm \
		-s WASM=1 \
		-s EXPORTED_RUNTIME_METHODS='["cwrap","ccall"]' \
		-s ALLOW_MEMORY_GROWTH=1 \
		-O2

check:
	$(CC) $(CFLAGS) \
		-Ic/algorithms/allocation \
		-Ic/algorithms/page_replacement \
		-Ic/algorithms/paging \
		-Ic/algorithms/segmentation \
		-Ic/algorithms/virtual_memory \
		$(C_SRCS) \
		-fsyntax-only

clean:
	rm -f $(WASM_OUT) simulator.js
