/*
 * best_fit.h
 * Best Fit allocation algorithm interface.
 */

#ifndef BEST_FIT_H
#define BEST_FIT_H

#include "../../model/memory_model.h"

int best_fit_allocate(MemoryMap *map, int process_id, int size);
void best_fit_free(MemoryMap *map, int process_id);
MemoryStats best_fit_stats(MemoryMap *map);

#endif /* BEST_FIT_H */
