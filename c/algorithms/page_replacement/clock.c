/*
 * clock.c
 * Clock (Second Chance) replacement: circular buffer with reference
 * bits. On fault, scan clockwise: if ref=1 clear and advance;
 * if ref=0 evict. Stores ref_bit_snapshot per step for visualisation.
 * Time complexity: O(frame_count) per fault in worst case.
 */

#include "clock.h"
#include <string.h>

static int frame_index(int *frames, int n, int page) {
    int i;
    for (i = 0; i < n; i++) if (frames[i] == page) return i;
    return -1;
}

PRResult clock_simulate(PRInput input) {
    PRResult result;
    memset(&result, 0, sizeof(PRResult));
    strncpy(result.algorithm_name, "Clock", 31);

    int frames[MAX_FRAMES_PR];
    int ref_bits[MAX_FRAMES_PR];
    int n = input.frame_count;
    int i, j;
    for (i = 0; i < n; i++) { frames[i] = -1; ref_bits[i] = 0; }
    int ptr = 0;
    int loaded = 0;

    for (i = 0; i < input.ref_length; i++) {
        int page = input.ref_string[i];
        PRStep *step = &result.steps[result.step_count++];
        step->step = i;
        step->page = page;
        step->frame_count = n;

        int idx = frame_index(frames, n, page);
        if (idx != -1) {
            step->page_fault = 0;
            result.total_hits++;
            ref_bits[idx] = 1;
        } else {
            step->page_fault = 1;
            result.total_faults++;

            if (loaded < n) {
                frames[ptr] = page;
                ref_bits[ptr] = 1;
                step->victim_page = -1;
                loaded++;
                ptr = (ptr + 1) % n;
            } else {
                while (ref_bits[ptr] == 1) {
                    ref_bits[ptr] = 0;
                    ptr = (ptr + 1) % n;
                }
                step->victim_page = frames[ptr];
                frames[ptr] = page;
                ref_bits[ptr] = 1;
                ptr = (ptr + 1) % n;
            }
        }

        for (j = 0; j < n; j++) {
            step->frames_snapshot[j] = frames[j];
            step->ref_bit_snapshot[j] = ref_bits[j];
        }
    }
    return result;
}
