/*
 * multi_level_pt.c
 * 2-level page table splitting a 32-bit virtual address into:
 * [L1 index: 10 bits][L2 index: 10 bits][Offset: 12 bits]
 * L1 table is always resident; L2 tables are created on demand.
 * Saves memory vs a single flat page table for sparse address spaces.
 * Time complexity: O(1) translation, O(1) mapping.
 */

#include "multi_level_pt.h"
#include <string.h>

void ml_pt_init(TwoLevelPageTable *pt) {
    memset(pt, 0, sizeof(TwoLevelPageTable));
    pt->page_size = 1 << OFFSET_BITS; /* 4096 */
}

MLTranslation ml_pt_translate(TwoLevelPageTable *pt, int virtual_address) {
    MLTranslation tr;
    memset(&tr, 0, sizeof(MLTranslation));
    tr.virtual_address = virtual_address;
    tr.physical_address = -1;

    unsigned int va = (unsigned int)virtual_address;
    tr.l1_index = (va >> (L2_BITS + OFFSET_BITS)) & 0x3FF;
    tr.l2_index = (va >> OFFSET_BITS) & 0x3FF;
    tr.offset   = va & 0xFFF;

    tr.levels_walked = 1;
    if (!pt->l1[tr.l1_index].present) {
        tr.fault = 1;
        pt->fault_count++;
        return tr;
    }

    tr.levels_walked = 2;
    if (!pt->l1[tr.l1_index].table[tr.l2_index].valid) {
        tr.fault = 1;
        pt->fault_count++;
        return tr;
    }

    int frame = pt->l1[tr.l1_index].table[tr.l2_index].frame_number;
    tr.physical_address = (frame << OFFSET_BITS) | tr.offset;
    return tr;
}

void ml_pt_map_page(TwoLevelPageTable *pt, int virtual_address, int frame_number) {
    unsigned int va = (unsigned int)virtual_address;
    int l1 = (va >> (L2_BITS + OFFSET_BITS)) & 0x3FF;
    int l2 = (va >> OFFSET_BITS) & 0x3FF;
    pt->l1[l1].present = 1;
    pt->l1[l1].table[l2].frame_number = frame_number;
    pt->l1[l1].table[l2].valid = 1;
}

int ml_pt_get_memory_overhead(TwoLevelPageTable *pt) {
    /* L1 table always allocated: L1_SIZE * sizeof(L1Entry) */
    int overhead = L1_SIZE * (int)sizeof(L1Entry);
    /* Each present L1 entry has an L2 table */
    int i;
    for (i = 0; i < L1_SIZE; i++) {
        if (pt->l1[i].present)
            overhead += L2_SIZE * (int)sizeof(L2Entry);
    }
    return overhead;
}
