/*
 * working_set.js
 * The working set W(t, delta) is the set of pages referenced in the
 * last 'delta' time units (window size). Tracks working set size over
 * time and reports locality changes and page faults.
 * JS port of c/algorithms/virtual_memory/working_set.c
 */

export function workingSetSimulate(input) {
  const { windowSize, refString } = input;
  const steps = [];
  let totalFaults = 0, maxWsSize = 0, totalWs = 0;

  for (let i = 0; i < refString.length; i++) {
    const page = refString[i];
    const start = Math.max(0, i - windowSize + 1);
    const ws = [...new Set(refString.slice(start, i + 1))];

    let pageFault = false;
    if (i === 0) {
      pageFault = true;
    } else {
      const prevStep = steps[steps.length - 1];
      pageFault = !prevStep.workingSet.includes(page);
    }
    if (pageFault) totalFaults++;

    totalWs += ws.length;
    if (ws.length > maxWsSize) maxWsSize = ws.length;

    steps.push({ timeStep: i, page, workingSet: ws, wsSize: ws.length, pageFault });
  }

  return {
    steps,
    stepCount: steps.length,
    totalFaults,
    maxWsSize,
    avgWsSize: steps.length > 0 ? totalWs / steps.length : 0
  };
}
