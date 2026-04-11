/*
 * inverted_pt.c
 * One entry per physical frame (not per virtual page). Each entry
 * stores (pid, page_number). To translate, search the table for
 * the matching (pid, page) pair. O(n) linear search by default.
 * Memory usage is proportional to physical memory, not virtual.
 * Time complexity: O(frame_count) per lookup.
 */

#include "inverted_pt.h"
#include <string.h>

void ipt_init(InvertedPageTable *ipt, int frame_count) {
    memset(ipt, 0, sizeof(InvertedPageTable));
    ipt->frame_count = frame_count < MAX_PHYSICAL_FRAMES ? frame_count : MAX_PHYSICAL_FRAMES;
}

InvertedTranslation ipt_translate(InvertedPageTable *ipt,
                                   int pid, int page_number, int offset) {
    InvertedTranslation tr;
    memset(&tr, 0, sizeof(InvertedTranslation));
    tr.pid = pid;
    tr.page_number = page_number;
    tr.frame_number = -1;
    tr.physical_address = -1;
    tr.fault = 1;

    int i;
    for (i = 0; i < ipt->frame_count; i++) {
        tr.search_steps++;
        if (ipt->table[i].valid &&
            ipt->table[i].pid == pid &&
            ipt->table[i].page_number == page_number) {
            tr.frame_number = i;
            tr.physical_address = i * 4096 + offset; /* assume 4KB pages */
            tr.fault = 0;
            return tr;
        }
    }
    return tr;
}

void ipt_load_page(InvertedPageTable *ipt, int frame, int pid, int page_number) {
    if (frame < 0 || frame >= ipt->frame_count) return;
    ipt->table[frame].pid = pid;
    ipt->table[frame].page_number = page_number;
    ipt->table[frame].valid = 1;
}

void ipt_free_process(InvertedPageTable *ipt, int pid) {
    int i;
    for (i = 0; i < ipt->frame_count; i++) {
        if (ipt->table[i].valid && ipt->table[i].pid == pid)
            ipt->table[i].valid = 0;
    }
}
