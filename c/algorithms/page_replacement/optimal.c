/*
 * optimal.c
 * Optimal (Belady's Min) replacement: evicts the page whose next
 * use is furthest in the future. Requires full reference string
 * known in advance. Theoretical lower bound on page faults.
 * Time complexity: O(ref_length^2 * frame_count).
 */

#include "optimal.h"
#include <string.h>

static int frame_index(int *frames, int n, int page) {
    int i;
    for (i = 0; i < n; i++) if (frames[i] == page) return i;
    return -1;
}

static int next_use(int *ref, int len, int from, int page) {
    int i;
    for (i = from; i < len; i++) if (ref[i] == page) return i;
    return len + 1; /* never used again */
}

PRResult optimal_simulate(PRInput input) {
    PRResult result;
    memset(&result, 0, sizeof(PRResult));
    strncpy(result.algorithm_name, "Optimal", 31);

    int frames[MAX_FRAMES_PR];
    int n = input.frame_count;
    int i, j;
    for (i = 0; i < n; i++) frames[i] = -1;
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
        } else {
            step->page_fault = 1;
            result.total_faults++;
            int victim;
            if (loaded < n) {
                victim = loaded++;
                step->victim_page = -1;
            } else {
                victim = 0;
                int max_next = next_use(input.ref_string, input.ref_length, i + 1, frames[0]);
                for (j = 1; j < n; j++) {
                    int nu = next_use(input.ref_string, input.ref_length, i + 1, frames[j]);
                    if (nu > max_next) { max_next = nu; victim = j; }
                }
                step->victim_page = frames[victim];
            }
            frames[victim] = page;
        }

        for (j = 0; j < n; j++) step->frames_snapshot[j] = frames[j];
    }
    return result;
}
