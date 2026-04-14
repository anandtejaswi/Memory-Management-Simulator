/*
 * lru.c
 * LRU page replacement: evicts the page whose last use was furthest
 * in the past. Tracks last-use timestamps per frame. O(n) per fault.
 * Does not exhibit Belady's anomaly. Stack algorithm.
 * Time complexity: O(ref_length * frame_count).
 */

#include "lru.h"
#include <string.h>

PRResult lru_simulate(PRInput input) {
    PRResult result;
    memset(&result, 0, sizeof(PRResult));
    strncpy(result.algorithm_name, "LRU", 31);

    int frames[MAX_FRAMES_PR];
    int time[MAX_FRAMES_PR];
    int *pages = input.ref_string;
    int n = input.ref_length;
    int f = input.frame_count;
    int i, j;
    int pageFaults = 0, hits = 0;
    int counter = 0, pos, min;

    for (i = 0; i < f; i++) {
        frames[i] = -1;
        time[i] = 0;
    }

    for (i = 0; i < n; i++) {
        int flag = 0;
        int victim = -1;

        for (j = 0; j < f; j++) {
            if (frames[j] == pages[i]) {
                flag = 1;
                hits++;
                counter++;
                time[j] = counter;
                break;
            }
        }

        if (flag == 0) {
            pageFaults++;
            counter++;
            min = time[0];
            pos = 0;

            for (j = 1; j < f; j++) {
                if (time[j] < min) {
                    min = time[j];
                    pos = j;
                }
            }

            victim = frames[pos];
            frames[pos] = pages[i];
            time[pos] = counter;
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
