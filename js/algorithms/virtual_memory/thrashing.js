/*
 * thrashing.js
 * Models thrashing by simulating N processes with working sets that may
 * exceed their allocated frames. As more processes are added, CPU
 * utilisation collapses as all time is spent on page faults.
 * JS port of c/algorithms/virtual_memory/thrashing.c
 */

export function thrashingSimulate(input) {
  const { processCount, framesPerProcess, workingSetSizes, totalFrames } = input;
  const steps = [];
  let thrashingOnsetStep = -1;
  let peakFaultRate = 0;

  for (let step = 1; step <= processCount; step++) {
    let totalWs = 0, totalFaults = 0;
    for (let p = 0; p < step; p++) {
      totalWs += workingSetSizes[p];
      const frames = framesPerProcess[p];
      const ws = workingSetSizes[p];
      if (ws > frames) totalFaults += (ws - frames) * 2;
    }

    let cpuUtil, thrashing;
    if (totalWs <= totalFrames) {
      cpuUtil = Math.min(95, 85 + step * 2);
      thrashing = false;
    } else {
      const excess = totalWs - totalFrames;
      const drop = Math.round((excess * 80) / (totalFrames || 1));
      cpuUtil = Math.max(5, 95 - drop);
      thrashing = cpuUtil < 30;
      if (thrashing && thrashingOnsetStep === -1) thrashingOnsetStep = step;
    }

    if (totalFaults > peakFaultRate) peakFaultRate = totalFaults;

    steps.push({
      timeStep: step,
      cpuUtilization: cpuUtil,
      thrashing,
      activeProcesses: step,
      totalPageFaults: totalFaults
    });
  }

  return {
    steps,
    stepCount: steps.length,
    thrashingOnsetStep,
    peakFaultRate
  };
}

export function thrashingDetect(result) {
  return result.thrashingOnsetStep;
}
