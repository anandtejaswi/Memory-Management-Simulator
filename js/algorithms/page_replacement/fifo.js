/*
 * fifo.js
 * FIFO page replacement: maintains a circular queue of loaded pages.
 * Evicts the oldest page (first in). O(1) per reference after init.
 * Suffers from Belady's anomaly: more frames can cause more faults.
 * JS port of c/algorithms/page_replacement/fifo.c
 */

export function fifoSimulate(input) {
  let pages = input.refString;
  let n = pages.length;
  let f = input.frames;
  let frames = [];
  let i, j, k = 0;
  let pageFaults = 0, hits = 0, flag;

  // Initialize frames as empty
  for(i = 0; i < f; i++) {
      frames[i] = -1;
  }

  let steps = [];

  // FIFO Logic
  for(i = 0; i < n; i++) {
      flag = 0;
      let victim = -1;

      // Check HIT
      for(j = 0; j < f; j++) {
          if(frames[j] === pages[i]) {
              flag = 1;
              break;
          }
      }

      // If FAULT
      if(flag === 0) {
          victim = frames[k];
          frames[k] = pages[i];   // Replace oldest
          k = (k + 1) % f;        // Move FIFO pointer
          pageFaults++;
      } else {
          hits++;
      }

      steps.push({
        step: i,
        page: pages[i],
        framesSnapshot: frames.slice(),
        frameCount: f,
        pageFault: (flag === 0),
        victimPage: victim,
        refBitSnapshot: new Array(f).fill(0)
      });
  }

  return { steps, totalFaults: pageFaults, totalHits: hits, algorithmName: 'FIFO' };
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
