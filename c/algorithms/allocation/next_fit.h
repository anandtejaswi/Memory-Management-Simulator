/*
 * next_fit.h
 * Next Fit allocation algorithm interface.
 */

#ifndef NEXT_FIT_H
#define NEXT_FIT_H

#include "../../model/memory_model.h"

int next_fit_allocate(MemoryMap *map, int process_id, int size);
void next_fit_free(MemoryMap *map, int process_id);
MemoryStats next_fit_stats(MemoryMap *map);

#endif /* NEXT_FIT_H */
