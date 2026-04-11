/*
 * fifo.c
 * FIFO page replacement: maintains a circular queue of loaded pages.
 * Evicts the oldest page (first in). O(1) per reference after init.
 * Suffers from Belady's anomaly: more frames can cause more faults.
 * Time complexity: O(ref_length * frame_count).
 */

#include "fifo.h"
#include <string.h>

static int frame_contains(int *frames, int n, int page) {
    int i;
    for (i = 0; i < n; i++) if (frames[i] == page) return 1;
    return 0;
}

PRResult fifo_simulate(PRInput input) {
    PRResult result;
    memset(&result, 0, sizeof(PRResult));
    strncpy(result.algorithm_name, "FIFO", 31);

    int frames[MAX_FRAMES_PR];
    int n = input.frame_count;
    int i, j;
    for (i = 0; i < n; i++) frames[i] = -1;

    int queue_ptr = 0;
    int loaded = 0;

    for (i = 0; i < input.ref_length; i++) {
        int page = input.ref_string[i];
        PRStep *step = &result.steps[result.step_count++];
        step->step = i;
        step->page = page;
        step->frame_count = n;

        if (frame_contains(frames, n, page)) {
            step->page_fault = 0;
            result.total_hits++;
        } else {
            step->page_fault = 1;
            result.total_faults++;
            step->victim_page = frames[queue_ptr];
            frames[queue_ptr] = page;
            queue_ptr = (queue_ptr + 1) % n;
            if (loaded < n) loaded++;
        }

        for (j = 0; j < n; j++) step->frames_snapshot[j] = frames[j];
    }
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
