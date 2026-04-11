/*
 * process.h
 * Process and ProcessTable structure definitions.
 */

#ifndef PROCESS_H
#define PROCESS_H

#define MAX_PROCESSES 64

typedef struct {
    int pid;
    int size;
    int allocated_size;
    int base_address;
    int is_active;
    int segment_count;
} Process;

typedef struct {
    Process list[MAX_PROCESSES];
    int count;
    int next_pid;
} ProcessTable;

#endif /* PROCESS_H */
