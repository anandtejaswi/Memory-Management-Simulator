/*
 * segmentation.c
 * Logical address space divided into named segments (code, stack, heap,
 * data, shared). Each segment has a base address and a limit. The segment
 * table stores base, limit, and protection bits (R/W/X) per segment.
 * A logical address = (segment_number, offset). A fault occurs if offset
 * >= limit or the operation violates protection bits.
 * Time complexity: O(1) translation.
 */

#include "segmentation.h"
#include <string.h>
#include <stdio.h>

void segmentation_init(SegmentTable *st, int process_id) {
    memset(st, 0, sizeof(SegmentTable));
    st->process_id = process_id;
}

int segmentation_add_segment(SegmentTable *st, int base, int limit,
                              int read, int write, int execute,
                              const char *name) {
    if (st->count >= MAX_SEGMENTS) return -1;
    Segment *s = &st->segments[st->count];
    s->segment_id = st->count;
    s->base = base;
    s->limit = limit;
    s->read = read;
    s->write = write;
    s->execute = execute;
    s->process_id = st->process_id;
    strncpy(s->name, name, 15);
    s->name[15] = '\0';
    return st->count++;
}

SegmentTranslation segmentation_translate(SegmentTable *st,
                                           int segment_number,
                                           int offset,
                                           int operation) {
    SegmentTranslation tr;
    memset(&tr, 0, sizeof(SegmentTranslation));
    tr.segment_number = segment_number;
    tr.offset = offset;
    tr.logical_address = segment_number * 10000 + offset;
    tr.physical_address = -1;

    if (segment_number < 0 || segment_number >= st->count) {
        tr.fault = 1;
        snprintf(tr.fault_reason, 63, "Invalid segment %d", segment_number);
        return tr;
    }

    Segment *s = &st->segments[segment_number];
    if (offset >= s->limit) {
        tr.fault = 1;
        snprintf(tr.fault_reason, 63, "Offset %d >= limit %d", offset, s->limit);
        return tr;
    }

    /* Check permissions: 0=read, 1=write, 2=execute */
    if (operation == 0 && !s->read) {
        tr.protection_fault = 1;
        snprintf(tr.fault_reason, 63, "Read not permitted on segment %d", segment_number);
        return tr;
    }
    if (operation == 1 && !s->write) {
        tr.protection_fault = 1;
        snprintf(tr.fault_reason, 63, "Write not permitted on segment %d", segment_number);
        return tr;
    }
    if (operation == 2 && !s->execute) {
        tr.protection_fault = 1;
        snprintf(tr.fault_reason, 63, "Execute not permitted on segment %d", segment_number);
        return tr;
    }

    tr.physical_address = s->base + offset;
    return tr;
}

void segmentation_remove_segment(SegmentTable *st, int segment_id) {
    if (segment_id < 0 || segment_id >= st->count) return;
    int i;
    for (i = segment_id; i < st->count - 1; i++) {
        st->segments[i] = st->segments[i + 1];
        st->segments[i].segment_id = i;
    }
    st->count--;
}
