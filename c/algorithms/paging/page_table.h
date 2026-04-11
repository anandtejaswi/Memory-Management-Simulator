/*
 * page_table.h - Paging and address translation interfaces
 */
#ifndef PAGE_TABLE_H
#define PAGE_TABLE_H

#define MAX_PAGES   512
#define MAX_FRAMES  256

typedef struct {
    int page_number;
    int frame_number;
    int valid;
    int dirty;
    int referenced;
    int access_count;
    int last_access_time;
} PageTableEntry;

typedef struct {
    PageTableEntry entries[MAX_PAGES];
    int page_count;
    int page_size;
    int fault_count;
    int access_count;
} PageTable;

typedef struct {
    int logical_address;
    int page_number;
    int offset;
    int frame_number;
    int physical_address;
    int page_fault;
    int tlb_hit;
} AddressTranslation;

/* Forward declaration */
typedef struct TLB TLB;

void page_table_init(PageTable *pt, int page_size, int num_pages);
AddressTranslation translate_address(PageTable *pt, TLB *tlb, int logical_address);
void load_page(PageTable *pt, int page_number, int frame_number);
void invalidate_page(PageTable *pt, int page_number);

#endif /* PAGE_TABLE_H */
