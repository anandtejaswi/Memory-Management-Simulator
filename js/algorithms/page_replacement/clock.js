/*
 * clock.js
 * Clock (Second Chance) replacement: circular buffer with reference
 * bits. On fault, scan clockwise: if ref=1 clear and advance;
 * if ref=0 evict. Stores ref_bit_snapshot per step for visualisation.
 * JS port of c/algorithms/page_replacement/clock.c
 */

export function clockSimulate(input) {
  const { frames: frameCount, refString } = input;
  const frames = new Array(frameCount).fill(-1);
  const refBits = new Array(frameCount).fill(0);
  const steps = [];
  let ptr = 0;
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
      refBitSnapshot: []
    };

    if (idx !== -1) {
      totalHits++;
      refBits[idx] = 1;
    } else {
      step.pageFault = true;
      totalFaults++;

      if (loaded < frameCount) {
        frames[ptr] = page;
        refBits[ptr] = 1;
        step.victimPage = -1;
        loaded++;
        ptr = (ptr + 1) % frameCount;
      } else {
        /* Scan clockwise until we find ref=0 */
        while (refBits[ptr] === 1) {
          refBits[ptr] = 0;
          ptr = (ptr + 1) % frameCount;
        }
        step.victimPage = frames[ptr];
        frames[ptr] = page;
        refBits[ptr] = 1;
        ptr = (ptr + 1) % frameCount;
      }
    }

    step.framesSnapshot = frames.slice();
    step.refBitSnapshot = refBits.slice();
    steps.push(step);
  }

  return { steps, totalFaults, totalHits, algorithmName: 'Clock' };
}
