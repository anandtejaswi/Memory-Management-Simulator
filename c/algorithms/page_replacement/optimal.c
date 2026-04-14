/*
 * optimal.c
 * Optimal (Belady's Min) replacement: evicts the page whose next
 * use is furthest in the future. Requires full reference string
 * known in advance. Theoretical lower bound on page faults.
 * Time complexity: O(ref_length^2 * frame_count).
 */

#include "optimal.h"
#include <string.h>

PRResult optimal_simulate(PRInput input) {
    PRResult result;
    memset(&result, 0, sizeof(PRResult));
    strncpy(result.algorithm_name, "Optimal", 31);

    int frames[MAX_FRAMES_PR];
    int *pages = input.ref_string;
    int n = input.ref_length;
    int f = input.frame_count;
    int i, j, k, pos, farthest;
    int faults = 0, hits = 0;

    for (i = 0; i < f; i++) frames[i] = -1;

    for (i = 0; i < n; i++) {
        int flag = 0;
        int victim = -1;

        for (j = 0; j < f; j++) {
            if (frames[j] == pages[i]) {
                flag = 1;
                hits++;
                break;
            }
        }

        if (flag == 0) {
            faults++;
            pos = -1;
            farthest = i;

            for (j = 0; j < f; j++) {
                int found = 0;
                for (k = i + 1; k < n; k++) {
                    if (frames[j] == pages[k]) {
                        if (k > farthest) {
                            farthest = k;
                            pos = j;
                        }
                        found = 1;
                        break;
                    }
                }
                if (found == 0) {
                    pos = j;
                    break;
                }
            }

            if (pos == -1) pos = 0;

            victim = frames[pos];
            frames[pos] = pages[i];
        }

        PRStep *step = &result.steps[result.step_count++];
        step->step = i;
        step->page = pages[i];
        step->frame_count = f;
        step->page_fault = (flag == 0);
        step->victim_page = victim;
        for (j = 0; j < f; j++) step->frames_snapshot[j] = frames[j];
    }

    result.total_faults = faults;
    result.total_hits = hits;
    return result;
}
