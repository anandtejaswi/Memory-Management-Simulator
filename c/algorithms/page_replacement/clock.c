/*
 * clock.c
 * Clock (Second Chance) replacement: circular buffer with reference
 * bits. On fault, scan clockwise: if ref=1 clear and advance;
 * if ref=0 evict. Stores ref_bit_snapshot per step for visualisation.
 * Time complexity: O(frame_count) per fault in worst case.
 */

#include "clock.h"
#include <string.h>

PRResult clock_simulate(PRInput input) {
    PRResult result;
    memset(&result, 0, sizeof(PRResult));
    strncpy(result.algorithm_name, "Clock", 31);

    int frames[MAX_FRAMES_PR];
    int ref[MAX_FRAMES_PR];
    int *pages = input.ref_string;
    int n = input.ref_length;
    int f = input.frame_count;
    int i, j;
    int pointer = 0;
    int faults = 0, hits = 0;

    for (i = 0; i < f; i++) {
        frames[i] = -1;
        ref[i] = 0;
    }

    for (i = 0; i < n; i++) {
        int flag = 0;
        int victim = -1;

        for (j = 0; j < f; j++) {
            if (frames[j] == pages[i]) {
                flag = 1;
                ref[j] = 1;
                hits++;
                break;
            }
        }

        if (flag == 0) {
            faults++;
            while (1) {
                if (ref[pointer] == 0) {
                    victim = frames[pointer];
                    frames[pointer] = pages[i];
                    ref[pointer] = 1;
                    pointer = (pointer + 1) % f;
                    break;
                } else {
                    ref[pointer] = 0;
                    pointer = (pointer + 1) % f;
                }
            }
        }

        PRStep *step = &result.steps[result.step_count++];
        step->step = i;
        step->page = pages[i];
        step->frame_count = f;
        step->page_fault = (flag == 0);
        step->victim_page = victim;
        for (j = 0; j < f; j++) {
            step->frames_snapshot[j] = frames[j];
            step->ref_bit_snapshot[j] = ref[j];
        }
    }

    result.total_faults = faults;
    result.total_hits = hits;
    return result;
}
