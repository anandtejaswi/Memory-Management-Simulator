/*
 * best_fit.c
 * Best Fit allocation: scan entire list, pick smallest block >= size.
 * O(n) per allocation. Minimises wasted space per allocation but
 * produces many tiny unusable fragments over time.
 * Time complexity: O(n) allocation, O(n) free + coalesce.
 */

#include "best_fit.h"
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

int best_fit_allocate(MemoryMap *map, int process_id, int size) {
    int m = map->block_count;
    int n = 1;
    int blockSize[MAX_BLOCKS];
    int k;
    for (k = 0; k < m; k++) {
        blockSize[k] = map->blocks[k].is_free ? map->blocks[k].size : 0;
    }
    int processSize[1] = {size};
    int allocation[1] = {-1};

    int i = 0;
    int bestIdx = -1;
    int j;
    for (j = 0; j < m; j++) {
        if (blockSize[j] >= processSize[i]) {
            if (bestIdx == -1 || blockSize[j] < blockSize[bestIdx]) {
                bestIdx = j;
            }
        }
    }

    if (bestIdx != -1) {
        allocation[i] = bestIdx;
        blockSize[bestIdx] -= processSize[i];
    }

    if (allocation[0] != -1) {
        j = allocation[0];
        split_block(map, j, size);
        map->blocks[j].is_free = 0;
        map->blocks[j].process_id = process_id;
        map->last_allocated_index = j;
        return map->blocks[j].base;
    }
    return -1;
}

void best_fit_free(MemoryMap *map, int process_id) {
    int i;
    for (i = 0; i < map->block_count; i++) {
        if (!map->blocks[i].is_free && map->blocks[i].process_id == process_id) {
            map->blocks[i].is_free = 1;
            map->blocks[i].process_id = -1;
        }
    }
    coalesce_free_blocks(map);
}

MemoryStats best_fit_stats(MemoryMap *map) {
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
