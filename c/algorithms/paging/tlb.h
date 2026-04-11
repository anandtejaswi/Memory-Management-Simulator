/*
 * tlb.h - Translation Lookaside Buffer interface
 */
#ifndef TLB_H
#define TLB_H

#define TLB_SIZE 16

typedef struct {
    int page_number;
    int frame_number;
    int valid;
    int last_used;
} TLBEntry;

struct TLB {
    TLBEntry entries[TLB_SIZE];
    int size;
    int hits;
    int misses;
};
typedef struct TLB TLB;

void  tlb_init(TLB *tlb);
int   tlb_lookup(TLB *tlb, int page_number, int *frame_number);
void  tlb_insert(TLB *tlb, int page_number, int frame_number);
void  tlb_flush(TLB *tlb);
float tlb_hit_ratio(TLB *tlb);

#endif /* TLB_H */
