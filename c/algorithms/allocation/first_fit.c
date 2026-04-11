/*
 * first_fit.c
 * First Fit allocation: scan from index 0 and allocate the first
 * free block >= requested size. O(n) per allocation.
 * Fast but causes clustering of small fragments at low addresses.
 * Time complexity: O(n) allocation, O(n) free + coalesce.
 */

#include "first_fit.h"
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

int first_fit_allocate(MemoryMap *map, int process_id, int size) {
    int i;
    for (i = 0; i < map->block_count; i++) {
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

void first_fit_free(MemoryMap *map, int process_id) {
    int i;
    for (i = 0; i < map->block_count; i++) {
        if (!map->blocks[i].is_free && map->blocks[i].process_id == process_id) {
            map->blocks[i].is_free = 1;
            map->blocks[i].process_id = -1;
        }
    }
    coalesce_free_blocks(map);
}

MemoryStats first_fit_stats(MemoryMap *map) {
    MemoryStats s;
    memset(&s, 0, sizeof(MemoryStats));
    s.total_size = map->total_size;
    s.block_count = map->block_count;
    int i;
    for (i = 0; i < map->block_count; i++) {
        if (map->blocks[i].is_free) {
            s.free_size += map->blocks[i].size;
            s.free_block_count++;
            if (map->blocks[i].size > s.external_fragmentation)
                s.external_fragmentation = map->blocks[i].size;
        } else {
            s.used_size += map->blocks[i].size;
        }
    }
    if (s.free_block_count > 0)
        s.external_fragmentation = s.free_size - s.external_fragmentation;
    return s;
}
