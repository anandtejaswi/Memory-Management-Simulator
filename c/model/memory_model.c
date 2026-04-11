/*
 * memory_model.c
 * Implementation of MemoryMap initialisation and helper utilities.
 */

#include "memory_model.h"
#include <string.h>

void memory_map_init(MemoryMap *map, int total_size) {
    memset(map, 0, sizeof(MemoryMap));
    map->total_size = total_size;
    map->block_count = 1;
    map->last_allocated_index = 0;
    map->blocks[0].id = 0;
    map->blocks[0].base = 0;
    map->blocks[0].size = total_size;
    map->blocks[0].is_free = 1;
    map->blocks[0].process_id = -1;
}
