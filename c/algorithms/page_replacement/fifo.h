/*
 * fifo.h - FIFO page replacement interface
 */
#ifndef FIFO_H
#define FIFO_H
#include "common.h"
PRResult fifo_simulate(PRInput input);
int fifo_check_beladys(PRInput input, int min_frames, int max_frames);
#endif
