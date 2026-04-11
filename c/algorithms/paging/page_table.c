/*
 * page_table.c
 * Flat page table implementation with TLB-assisted address translation.
 * Each virtual page maps to a frame. A page fault occurs when the valid
 * bit is 0. TLB is checked first for fast translation.
 * Time complexity: O(1) TLB hit, O(n) TLB miss + lookup.
 */

#include "page_table.h"
#include "tlb.h"
#include <string.h>

void page_table_init(PageTable *pt, int page_size, int num_pages) {
    memset(pt, 0, sizeof(PageTable));
    pt->page_size = page_size;
    pt->page_count = num_pages;
    int i;
    for (i = 0; i < num_pages && i < MAX_PAGES; i++) {
        pt->entries[i].page_number = i;
        pt->entries[i].frame_number = i; /* default 1:1 mapping */
        pt->entries[i].valid = 1;
        pt->entries[i].dirty = 0;
        pt->entries[i].referenced = 0;
        pt->entries[i].access_count = 0;
        pt->entries[i].last_access_time = -1;
    }
}

AddressTranslation translate_address(PageTable *pt, TLB *tlb, int logical_address) {
    AddressTranslation tr;
    memset(&tr, 0, sizeof(AddressTranslation));
    tr.logical_address = logical_address;
    tr.page_number = logical_address / pt->page_size;
    tr.offset = logical_address % pt->page_size;

    int frame = -1;
    if (tlb_lookup(tlb, tr.page_number, &frame)) {
        tr.tlb_hit = 1;
        tr.frame_number = frame;
    } else {
        tr.tlb_hit = 0;
        if (tr.page_number < pt->page_count && pt->entries[tr.page_number].valid) {
            tr.frame_number = pt->entries[tr.page_number].frame_number;
            tlb_insert(tlb, tr.page_number, tr.frame_number);
        } else {
            tr.page_fault = 1;
            pt->fault_count++;
            tr.frame_number = -1;
            tr.physical_address = -1;
            pt->access_count++;
            return tr;
        }
    }

    tr.physical_address = tr.frame_number * pt->page_size + tr.offset;
    pt->entries[tr.page_number].access_count++;
    pt->entries[tr.page_number].referenced = 1;
    pt->access_count++;
    return tr;
}

void load_page(PageTable *pt, int page_number, int frame_number) {
    if (page_number >= MAX_PAGES) return;
    pt->entries[page_number].page_number = page_number;
    pt->entries[page_number].frame_number = frame_number;
    pt->entries[page_number].valid = 1;
    if (page_number >= pt->page_count) pt->page_count = page_number + 1;
}

void invalidate_page(PageTable *pt, int page_number) {
    if (page_number >= MAX_PAGES) return;
    pt->entries[page_number].valid = 0;
}
