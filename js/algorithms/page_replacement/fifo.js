/*
 * fifo.js
 * FIFO page replacement: maintains a circular queue of loaded pages.
 * Evicts the oldest page (first in). O(1) per reference after init.
 * Suffers from Belady's anomaly: more frames can cause more faults.
 * JS port of c/algorithms/page_replacement/fifo.c
 */

export function fifoSimulate(input) {
  const { frames: frameCount, refString } = input;
  const frames = new Array(frameCount).fill(-1);
  const steps = [];
  let queuePtr = 0;
  let loaded = 0;
  let totalFaults = 0, totalHits = 0;

  for (let i = 0; i < refString.length; i++) {
    const page = refString[i];
    const inFrame = frames.includes(page);
    const step = {
      step: i,
      page,
      framesSnapshot: frames.slice(),
      frameCount,
      pageFault: false,
      victimPage: -1,
      refBitSnapshot: new Array(frameCount).fill(0)
    };

    if (inFrame) {
      totalHits++;
    } else {
      step.pageFault = true;
      totalFaults++;
      step.victimPage = frames[queuePtr];
      frames[queuePtr] = page;
      queuePtr = (queuePtr + 1) % frameCount;
      if (loaded < frameCount) loaded++;
    }

    step.framesSnapshot = frames.slice();
    steps.push(step);
  }

  return { steps, totalFaults, totalHits, algorithmName: 'FIFO' };
}

export function fifoCheckBeladys(input, minFrames, maxFrames) {
  const faults = [];
  for (let f = minFrames; f <= maxFrames; f++) {
    const r = fifoSimulate({ frames: f, refString: input.refString });
    faults.push({ frames: f, faults: r.totalFaults });
  }
  for (let i = 1; i < faults.length; i++) {
    if (faults[i].faults > faults[i - 1].faults) {
      return { anomalyDetected: true, data: faults };
    }
  }
  return { anomalyDetected: false, data: faults };
}
