/*
 * working_set.h - Working Set Model interface
 */
#ifndef WORKING_SET_H
#define WORKING_SET_H

#define MAX_REF_STRING 512
#define MAX_PAGES      512
#define MAX_WS_HISTORY 1024

typedef struct {
    int window_size;
    int ref_string[MAX_REF_STRING];
    int ref_length;
} WSInput;

typedef struct {
    int time_step;
    int page;
    int working_set[MAX_PAGES];
    int ws_size;
    int page_fault;
} WSStep;

typedef struct {
    WSStep steps[MAX_WS_HISTORY];
    int step_count;
    int total_faults;
    int max_ws_size;
    float avg_ws_size;
} WSResult;

WSResult working_set_simulate(WSInput input);

#endif /* WORKING_SET_H */
