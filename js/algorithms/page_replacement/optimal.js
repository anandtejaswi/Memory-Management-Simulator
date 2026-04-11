/*
 * optimal.js
 * Optimal (Belady's Min) replacement: evicts the page whose next
 * use is furthest in the future. Requires full reference string
 * known in advance. Theoretical lower bound on page faults.
 * JS port of c/algorithms/page_replacement/optimal.c
 */

function nextUse(refString, from, page) {
  for (let i = from; i < refString.length; i++) {
    if (refString[i] === page) return i;
  }
  return refString.length + 1;
}

export function optimalSimulate(input) {
  const { frames: frameCount, refString } = input;
  const frames = new Array(frameCount).fill(-1);
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
    } else {
      step.pageFault = true;
      totalFaults++;
      let victim;
      if (loaded < frameCount) {
        victim = loaded++;
        step.victimPage = -1;
      } else {
        victim = 0;
        let maxNext = nextUse(refString, i + 1, frames[0]);
        for (let j = 1; j < frameCount; j++) {
          const nu = nextUse(refString, i + 1, frames[j]);
          if (nu > maxNext) { maxNext = nu; victim = j; }
        }
        step.victimPage = frames[victim];
      }
      frames[victim] = page;
    }

    step.framesSnapshot = frames.slice();
    steps.push(step);
  }

  return { steps, totalFaults, totalHits, algorithmName: 'Optimal' };
}
