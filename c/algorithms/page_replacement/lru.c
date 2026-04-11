/*
 * lru.c
 * LRU page replacement: evicts the page whose last use was furthest
 * in the past. Tracks last-use timestamps per frame. O(n) per fault.
 * Does not exhibit Belady's anomaly. Stack algorithm.
 * Time complexity: O(ref_length * frame_count).
 */

#include "lru.h"
#include <string.h>

static int frame_index(int *frames, int n, int page) {
    int i;
    for (i = 0; i < n; i++) if (frames[i] == page) return i;
    return -1;
}

PRResult lru_simulate(PRInput input) {
    PRResult result;
    memset(&result, 0, sizeof(PRResult));
    strncpy(result.algorithm_name, "LRU", 31);

    int frames[MAX_FRAMES_PR];
    int last_used[MAX_FRAMES_PR];
    int n = input.frame_count;
    int i, j;
    for (i = 0; i < n; i++) { frames[i] = -1; last_used[i] = -1; }
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
            last_used[idx] = i;
        } else {
            step->page_fault = 1;
            result.total_faults++;
            int victim = 0;
            if (loaded < n) {
                victim = loaded++;
                step->victim_page = -1;
            } else {
                int min_t = last_used[0];
                victim = 0;
                for (j = 1; j < n; j++) {
                    if (last_used[j] < min_t) { min_t = last_used[j]; victim = j; }
                }
                step->victim_page = frames[victim];
            }
            frames[victim] = page;
            last_used[victim] = i;
        }

        for (j = 0; j < n; j++) step->frames_snapshot[j] = frames[j];
    }
    return result;
}
