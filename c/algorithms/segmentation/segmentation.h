/*
 * segmentation.h - Segmentation interface
 */
#ifndef SEGMENTATION_H
#define SEGMENTATION_H

#define MAX_SEGMENTS 32

typedef struct {
    int segment_id;
    int base;
    int limit;
    int read;
    int write;
    int execute;
    int process_id;
    char name[16];
} Segment;

typedef struct {
    Segment segments[MAX_SEGMENTS];
    int count;
    int process_id;
} SegmentTable;

typedef struct {
    int logical_address;
    int segment_number;
    int offset;
    int physical_address;
    int fault;
    int protection_fault;
    char fault_reason[64];
} SegmentTranslation;

void segmentation_init(SegmentTable *st, int process_id);
int  segmentation_add_segment(SegmentTable *st, int base, int limit,
                               int read, int write, int execute,
                               const char *name);
SegmentTranslation segmentation_translate(SegmentTable *st,
                                          int segment_number,
                                          int offset,
                                          int operation);
void segmentation_remove_segment(SegmentTable *st, int segment_id);

#endif /* SEGMENTATION_H */
