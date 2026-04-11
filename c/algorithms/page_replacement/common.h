/*
 * common.h
 * Shared data structures for page replacement algorithms.
 */

#ifndef COMMON_H
#define COMMON_H

#define MAX_FRAMES_PR  16
#define MAX_REF_STRING 512

typedef struct {
    int frames[MAX_FRAMES_PR];
    int frame_count;
    int ref_string[MAX_REF_STRING];
    int ref_length;
} PRInput;

typedef struct {
    int step;
    int page;
    int frames_snapshot[MAX_FRAMES_PR];
    int frame_count;
    int page_fault;
    int victim_page;
    int ref_bit_snapshot[MAX_FRAMES_PR];
} PRStep;

typedef struct {
    PRStep steps[MAX_REF_STRING];
    int step_count;
    int total_faults;
    int total_hits;
    char algorithm_name[32];
} PRResult;

#endif /* COMMON_H */
