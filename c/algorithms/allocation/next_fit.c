/*
 * next_fit.c
 * Next Fit allocation: like First Fit but resumes scanning from
 * where the last allocation ended (stored in map->last_allocated_index).
 * Distributes allocations more evenly across memory.
 * Time complexity: O(n) amortised per allocation.
 */

#include "next_fit.h"
#include <string.h>

static void coalesce_free_blocks(MemoryMap *map) {
    int i;
    for (i = 0; i < map->block_count - 1; ) {
        if (map->blocks[i].is_free && map->blocks[i + 1].is_free) {
            map->blocks[i].size += map->blocks[i + 1].size;
            int j;
            for (j = i + 1; j < map->block_count - 1; j++) {
                map->blocks[j] = map->blocks[j + 1];
            }
            map->block_count--;
            if (map->last_allocated_index > i)
                map->last_allocated_index--;
        } else {
            i++;
        }
    }
}

static void split_block(MemoryMap *map, int index, int size) {
    if (map->blocks[index].size == size) return;
    if (map->block_count >= MAX_BLOCKS) return;
    int j;
    for (j = map->block_count; j > index + 1; j--) {
        map->blocks[j] = map->blocks[j - 1];
    }
    map->blocks[index + 1].id = map->block_count;
    map->blocks[index + 1].base = map->blocks[index].base + size;
    map->blocks[index + 1].size = map->blocks[index].size - size;
    map->blocks[index + 1].is_free = 1;
    map->blocks[index + 1].process_id = -1;
    map->blocks[index].size = size;
    map->block_count++;
}

int next_fit_allocate(MemoryMap *map, int process_id, int size) {
    int start = map->last_allocated_index;
    int i, tries;
    for (tries = 0; tries < map->block_count; tries++) {
        i = (start + tries) % map->block_count;
        if (map->blocks[i].is_free && map->blocks[i].size >= size) {
            split_block(map, i, size);
            map->blocks[i].is_free = 0;
            map->blocks[i].process_id = process_id;
            map->last_allocated_index = i;
            return map->blocks[i].base;
        }
    }
    return -1;
}

void next_fit_free(MemoryMap *map, int process_id) {
    int i;
    for (i = 0; i < map->block_count; i++) {
        if (!map->blocks[i].is_free && map->blocks[i].process_id == process_id) {
            map->blocks[i].is_free = 1;
            map->blocks[i].process_id = -1;
        }
    }
    coalesce_free_blocks(map);
}

MemoryStats next_fit_stats(MemoryMap *map) {
    MemoryStats s;
    memset(&s, 0, sizeof(MemoryStats));
    s.total_size = map->total_size;
    s.block_count = map->block_count;
    int i, largest_free = 0;
    for (i = 0; i < map->block_count; i++) {
        if (map->blocks[i].is_free) {
            s.free_size += map->blocks[i].size;
            s.free_block_count++;
            if (map->blocks[i].size > largest_free)
                largest_free = map->blocks[i].size;
        } else {
            s.used_size += map->blocks[i].size;
        }
    }
    if (s.free_block_count > 1)
        s.external_fragmentation = s.free_size - largest_free;
    return s;
}
