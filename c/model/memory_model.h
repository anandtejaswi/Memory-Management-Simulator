/*
 * memory_model.h
 * Defines MemoryBlock, MemoryMap, and MemoryStats structures.
 * These are the core data structures shared by all allocation algorithms.
 */

#ifndef MEMORY_MODEL_H
#define MEMORY_MODEL_H

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

#endif /* MEMORY_MODEL_H */
