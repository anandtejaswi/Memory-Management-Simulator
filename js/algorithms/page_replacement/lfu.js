/*
 * lfu.js
 * LFU page replacement: evicts the page with the lowest access count.
 * Ties broken by LRU among equal-frequency pages.
 * Can retain old frequently-used pages that are no longer needed.
 * JS port of c/algorithms/page_replacement/lfu.c
 */

export function lfuSimulate(input) {
  const { frames: frameCount, refString } = input;
  const frames = new Array(frameCount).fill(-1);
  const freq = new Array(frameCount).fill(0);
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
      freq[idx]++;
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
          if (freq[j] < freq[victim] ||
              (freq[j] === freq[victim] && lastUsed[j] < lastUsed[victim])) {
            victim = j;
          }
        }
        step.victimPage = frames[victim];
      }
      frames[victim] = page;
      freq[victim] = 1;
      lastUsed[victim] = i;
    }

    step.framesSnapshot = frames.slice();
    steps.push(step);
  }

  return { steps, totalFaults, totalHits, algorithmName: 'LFU' };
}
