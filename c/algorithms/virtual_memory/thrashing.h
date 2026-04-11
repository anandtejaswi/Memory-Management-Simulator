/*
 * thrashing.h - Thrashing simulation interface
 */
#ifndef THRASHING_H
#define THRASHING_H

#define MAX_PROCESSES 64

typedef struct {
    int process_count;
    int frames_per_process[MAX_PROCESSES];
    int working_set_sizes[MAX_PROCESSES];
    int total_frames;
} ThrashingInput;

typedef struct {
    int time_step;
    int cpu_utilization;
    int thrashing;
    int active_processes;
    int total_page_faults;
} ThrashingStep;

typedef struct {
    ThrashingStep steps[256];
    int step_count;
    int thrashing_onset_step;
    int peak_fault_rate;
} ThrashingResult;

ThrashingResult thrashing_simulate(ThrashingInput input);
int thrashing_detect(ThrashingResult *result);

#endif /* THRASHING_H */
