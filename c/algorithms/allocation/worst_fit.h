/*
 * worst_fit.h
 * Worst Fit allocation algorithm interface.
 */

#ifndef WORST_FIT_H
#define WORST_FIT_H

#include "../../model/memory_model.h"

int worst_fit_allocate(MemoryMap *map, int process_id, int size);
void worst_fit_free(MemoryMap *map, int process_id);
MemoryStats worst_fit_stats(MemoryMap *map);

#endif /* WORST_FIT_H */
