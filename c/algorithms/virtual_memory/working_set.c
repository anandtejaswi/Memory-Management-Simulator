/*
 * working_set.c
 * The working set W(t, delta) is the set of pages referenced in the
 * last 'delta' time units (window size). A process is resident only
 * if all pages in its working set are in memory. Tracks working set
 * size over time and reports locality changes.
 * Time complexity: O(ref_length * window_size).
 */

#include "working_set.h"
#include <string.h>

WSResult working_set_simulate(WSInput input) {
    WSResult result;
    memset(&result, 0, sizeof(WSResult));
    int i, j, k;
    int total_ws = 0;

    for (i = 0; i < input.ref_length && i < MAX_WS_HISTORY; i++) {
        int page = input.ref_string[i];
        WSStep *step = &result.steps[result.step_count];
        step->time_step = i;
        step->page = page;
        step->ws_size = 0;

        /* Compute working set: unique pages in [max(0, i-delta+1), i] */
        int ws[MAX_PAGES];
        int ws_n = 0;
        int start = i - input.window_size + 1;
        if (start < 0) start = 0;

        for (j = start; j <= i; j++) {
            int p = input.ref_string[j];
            int found = 0;
            for (k = 0; k < ws_n; k++) if (ws[k] == p) { found = 1; break; }
            if (!found && ws_n < MAX_PAGES) ws[ws_n++] = p;
        }

        for (k = 0; k < ws_n && k < MAX_PAGES; k++) step->working_set[k] = ws[k];
        step->ws_size = ws_n;

        /* Page fault if current page was not in the previous working set */
        if (i == 0) {
            step->page_fault = 1;
        } else {
            WSStep *prev = &result.steps[result.step_count - 1];
            int found = 0;
            for (k = 0; k < prev->ws_size; k++)
                if (prev->working_set[k] == page) { found = 1; break; }
            step->page_fault = !found;
        }
        if (step->page_fault) result.total_faults++;

        total_ws += ws_n;
        if (ws_n > result.max_ws_size) result.max_ws_size = ws_n;
        result.step_count++;
    }

    result.avg_ws_size = result.step_count > 0 ?
                         (float)total_ws / result.step_count : 0.0f;
    return result;
}
