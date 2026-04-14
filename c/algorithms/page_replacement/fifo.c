/*
 * fifo.c
 * FIFO page replacement: maintains a circular queue of loaded pages.
 * Evicts the oldest page (first in). O(1) per reference after init.
 * Suffers from Belady's anomaly: more frames can cause more faults.
 * Time complexity: O(ref_length * frame_count).
 */

#include "fifo.h"
#include <string.h>

PRResult fifo_simulate(PRInput input) {
    PRResult result;
    memset(&result, 0, sizeof(PRResult));
    strncpy(result.algorithm_name, "FIFO", 31);

    int frames[MAX_FRAMES_PR];
    int *pages = input.ref_string;
    int n = input.ref_length;
    int f = input.frame_count;
    int i, j, k = 0;
    int pageFaults = 0, hits = 0, flag;

    for (i = 0; i < f; i++) frames[i] = -1;

    for (i = 0; i < n; i++) {
        flag = 0;
        int victim = -1;

        for (j = 0; j < f; j++) {
            if (frames[j] == pages[i]) {
                flag = 1;
                break;
            }
        }

        if (flag == 0) {
            victim = frames[k];
            frames[k] = pages[i];
            k = (k + 1) % f;
            pageFaults++;
        } else {
            hits++;
        }

        PRStep *step = &result.steps[result.step_count++];
        step->step = i;
        step->page = pages[i];
        step->frame_count = f;
        step->page_fault = (flag == 0);
        step->victim_page = victim;
        for (j = 0; j < f; j++) step->frames_snapshot[j] = frames[j];
    }

    result.total_faults = pageFaults;
    result.total_hits = hits;
    return result;
}

int fifo_check_beladys(PRInput input, int min_frames, int max_frames) {
    int faults[20];
    int f;
    for (f = min_frames; f <= max_frames && f < 20; f++) {
        PRInput tmp = input;
        tmp.frame_count = f;
        PRResult r = fifo_simulate(tmp);
        faults[f] = r.total_faults;
        if (f > min_frames && faults[f] > faults[f - 1]) return 1;
    }
    return 0;
}
