/*
 * multi_level_pt.h - 2-level page table interface
 */
#ifndef MULTI_LEVEL_PT_H
#define MULTI_LEVEL_PT_H

#define L1_BITS     10
#define L2_BITS     10
#define OFFSET_BITS 12
#define L1_SIZE     1024
#define L2_SIZE     1024

typedef struct {
    int frame_number;
    int valid;
} L2Entry;

typedef struct {
    L2Entry table[L2_SIZE];
    int present;
} L1Entry;

typedef struct {
    L1Entry l1[L1_SIZE];
    int page_size;
    int fault_count;
} TwoLevelPageTable;

typedef struct {
    int virtual_address;
    int l1_index;
    int l2_index;
    int offset;
    int physical_address;
    int fault;
    int levels_walked;
} MLTranslation;

void ml_pt_init(TwoLevelPageTable *pt);
MLTranslation ml_pt_translate(TwoLevelPageTable *pt, int virtual_address);
void ml_pt_map_page(TwoLevelPageTable *pt, int virtual_address, int frame_number);
int  ml_pt_get_memory_overhead(TwoLevelPageTable *pt);

#endif /* MULTI_LEVEL_PT_H */
