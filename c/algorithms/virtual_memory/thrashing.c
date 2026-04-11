/*
 * thrashing.c
 * Models thrashing by simulating N processes each with a working set
 * larger than their allocated frames. As more processes are added,
 * the sum of working sets exceeds total frames, causing CPU utilisation
 * to collapse as all time is spent handling page faults.
 * Reports CPU utilisation and fault rate at each time step.
 * Time complexity: O(process_count^2).
 */

#include "thrashing.h"
#include <string.h>

ThrashingResult thrashing_simulate(ThrashingInput input) {
    ThrashingResult result;
    memset(&result, 0, sizeof(ThrashingResult));
    result.thrashing_onset_step = -1;

    int step, p;
    for (step = 1; step <= input.process_count && step <= 256; step++) {
        ThrashingStep *s = &result.steps[result.step_count];
        s->time_step = step;
        s->active_processes = step;

        /* Sum of working set sizes for active processes */
        int total_ws = 0;
        int total_faults = 0;
        for (p = 0; p < step; p++) {
            total_ws += input.working_set_sizes[p];
            int frames = input.frames_per_process[p];
            int ws = input.working_set_sizes[p];
            if (ws > frames) total_faults += (ws - frames) * 2;
        }

        /* CPU utilisation model:
         * If sum(WS) <= total_frames: high utilisation
         * Otherwise drops proportionally */
        if (total_ws <= input.total_frames) {
            s->cpu_utilization = 85 + (step * 2);
            if (s->cpu_utilization > 95) s->cpu_utilization = 95;
            s->thrashing = 0;
        } else {
            int excess = total_ws - input.total_frames;
            int drop = (excess * 80) / (input.total_frames > 0 ? input.total_frames : 1);
            s->cpu_utilization = 95 - drop;
            if (s->cpu_utilization < 5) s->cpu_utilization = 5;
            s->thrashing = (s->cpu_utilization < 30) ? 1 : 0;
            if (s->thrashing && result.thrashing_onset_step == -1)
                result.thrashing_onset_step = step;
        }

        s->total_page_faults = total_faults;
        if (total_faults > result.peak_fault_rate)
            result.peak_fault_rate = total_faults;

        result.step_count++;
    }
    return result;
}

int thrashing_detect(ThrashingResult *result) {
    return result->thrashing_onset_step;
}
