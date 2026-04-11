/*
 * first_fit.h
 * First Fit allocation algorithm interface.
 */

#ifndef FIRST_FIT_H
#define FIRST_FIT_H

#include "../../model/memory_model.h"

int first_fit_allocate(MemoryMap *map, int process_id, int size);
void first_fit_free(MemoryMap *map, int process_id);
MemoryStats first_fit_stats(MemoryMap *map);

#endif /* FIRST_FIT_H */
