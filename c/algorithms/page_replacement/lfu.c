/*
 * lfu.c
 * LFU page replacement: evicts the page with the lowest access count.
 * Ties broken by LRU among equal-frequency pages.
 * Can retain old frequently-used pages that are no longer needed.
 * Time complexity: O(ref_length * frame_count).
 */

#include "lfu.h"
#include <string.h>

static int frame_index(int *frames, int n, int page) {
    int i;
    for (i = 0; i < n; i++) if (frames[i] == page) return i;
    return -1;
}

PRResult lfu_simulate(PRInput input) {
    PRResult result;
    memset(&result, 0, sizeof(PRResult));
    strncpy(result.algorithm_name, "LFU", 31);

    int frames[MAX_FRAMES_PR];
    int freq[MAX_FRAMES_PR];
    int last_used[MAX_FRAMES_PR];
    int n = input.frame_count;
    int i, j;
    for (i = 0; i < n; i++) { frames[i] = -1; freq[i] = 0; last_used[i] = -1; }
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
            freq[idx]++;
            last_used[idx] = i;
        } else {
            step->page_fault = 1;
            result.total_faults++;
            int victim;
            if (loaded < n) {
                victim = loaded++;
                step->victim_page = -1;
            } else {
                victim = 0;
                for (j = 1; j < n; j++) {
                    if (freq[j] < freq[victim] ||
                        (freq[j] == freq[victim] && last_used[j] < last_used[victim])) {
                        victim = j;
                    }
                }
                step->victim_page = frames[victim];
            }
            frames[victim] = page;
            freq[victim] = 1;
            last_used[victim] = i;
        }

        for (j = 0; j < n; j++) step->frames_snapshot[j] = frames[j];
    }
    return result;
}
