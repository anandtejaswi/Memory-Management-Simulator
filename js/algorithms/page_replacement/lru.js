/*
 * lru.js
 * LRU page replacement: evicts the page whose last use was furthest
 * in the past. Tracks last-use timestamps per frame. O(n) per fault.
 * Does not exhibit Belady's anomaly. Stack algorithm.
 * JS port of c/algorithms/page_replacement/lru.c
 */

export function lruSimulate(input) {
  const { frames: frameCount, refString } = input;
  const frames = new Array(frameCount).fill(-1);
  const lastUsed = new Array(frameCount).fill(-1);
  const steps = [];
  let loaded = 0;
  let totalFaults = 0, totalHits = 0;

  for (let i = 0; i < refString.length; i++) {
    const page = refString[i];
    const idx = frames.indexOf(page);
    const step = {
      step: i,
      page,
      framesSnapshot: [],
      frameCount,
      pageFault: false,
      victimPage: -1,
      refBitSnapshot: new Array(frameCount).fill(0)
    };

    if (idx !== -1) {
      totalHits++;
      lastUsed[idx] = i;
    } else {
      step.pageFault = true;
      totalFaults++;
      let victim;
      if (loaded < frameCount) {
        victim = loaded++;
        step.victimPage = -1;
      } else {
        victim = 0;
        for (let j = 1; j < frameCount; j++) {
          if (lastUsed[j] < lastUsed[victim]) victim = j;
        }
        step.victimPage = frames[victim];
      }
      frames[victim] = page;
      lastUsed[victim] = i;
    }

    step.framesSnapshot = frames.slice();
    steps.push(step);
  }

  return { steps, totalFaults, totalHits, algorithmName: 'LRU' };
}
