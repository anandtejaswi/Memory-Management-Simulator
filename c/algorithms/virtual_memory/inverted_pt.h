/*
 * inverted_pt.h - Inverted Page Table interface
 */
#ifndef INVERTED_PT_H
#define INVERTED_PT_H

#define MAX_PHYSICAL_FRAMES 256

typedef struct {
    int pid;
    int page_number;
    int valid;
} InvertedEntry;

typedef struct {
    InvertedEntry table[MAX_PHYSICAL_FRAMES];
    int frame_count;
} InvertedPageTable;

typedef struct {
    int pid;
    int page_number;
    int frame_number;
    int physical_address;
    int fault;
    int search_steps;
} InvertedTranslation;

void ipt_init(InvertedPageTable *ipt, int frame_count);
InvertedTranslation ipt_translate(InvertedPageTable *ipt,
                                   int pid, int page_number,
                                   int offset);
void ipt_load_page(InvertedPageTable *ipt, int frame, int pid, int page_number);
void ipt_free_process(InvertedPageTable *ipt, int pid);

#endif /* INVERTED_PT_H */
