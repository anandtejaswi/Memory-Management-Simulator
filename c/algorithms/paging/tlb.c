/*
 * tlb.c
 * Translation Lookaside Buffer: small fully-associative cache of page-to-frame
 * mappings. Uses LRU eviction when full. Provides fast O(n) lookup where n=TLB_SIZE.
 * Time complexity: O(TLB_SIZE) per lookup/insert.
 */

#include "tlb.h"
#include <string.h>

void tlb_init(TLB *tlb) {
    memset(tlb, 0, sizeof(TLB));
    tlb->size = TLB_SIZE;
    int i;
    for (i = 0; i < TLB_SIZE; i++) tlb->entries[i].valid = 0;
}

int tlb_lookup(TLB *tlb, int page_number, int *frame_number) {
    static int time_counter = 0;
    time_counter++;
    int i;
    for (i = 0; i < TLB_SIZE; i++) {
        if (tlb->entries[i].valid && tlb->entries[i].page_number == page_number) {
            *frame_number = tlb->entries[i].frame_number;
            tlb->entries[i].last_used = time_counter;
            tlb->hits++;
            return 1;
        }
    }
    tlb->misses++;
    return 0;
}

void tlb_insert(TLB *tlb, int page_number, int frame_number) {
    static int time_counter = 0;
    time_counter++;
    /* Find empty slot first */
    int i, victim = -1, min_t = 0x7fffffff;
    for (i = 0; i < TLB_SIZE; i++) {
        if (!tlb->entries[i].valid) { victim = i; break; }
        if (tlb->entries[i].last_used < min_t) {
            min_t = tlb->entries[i].last_used;
            victim = i;
        }
    }
    tlb->entries[victim].page_number = page_number;
    tlb->entries[victim].frame_number = frame_number;
    tlb->entries[victim].valid = 1;
    tlb->entries[victim].last_used = time_counter;
}

void tlb_flush(TLB *tlb) {
    int i;
    for (i = 0; i < TLB_SIZE; i++) tlb->entries[i].valid = 0;
    tlb->hits = 0;
    tlb->misses = 0;
}

float tlb_hit_ratio(TLB *tlb) {
    int total = tlb->hits + tlb->misses;
    if (total == 0) return 0.0f;
    return (float)tlb->hits / (float)total;
}
