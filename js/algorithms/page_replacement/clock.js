/*
 * clock.js
 * Clock (Second Chance) replacement: circular buffer with reference
 * bits. On fault, scan clockwise: if ref=1 clear and advance;
 * if ref=0 evict. Stores ref_bit_snapshot per step for visualisation.
 * JS port of c/algorithms/page_replacement/clock.c
 */

export function clockSimulate(input) {
  let pages = input.refString;
  let n = pages.length;
  let f = input.frames;
  let frames = [];
  let ref = [];
  let i, j;
  let pointer = 0;
  let faults = 0, hits = 0;

  for(i = 0; i < f; i++) {
      frames[i] = -1;
      ref[i] = 0;
  }

  let steps = [];

  for(i = 0; i < n; i++) {
      let flag = 0;
      let victim = -1;

      // HIT check
      for(j = 0; j < f; j++) {
          if(frames[j] === pages[i]) {
              flag = 1;
              ref[j] = 1;   // give second chance
              hits++;
              break;
          }
      }

      // If FAULT
      if(flag === 0) {
          faults++;

          while(1) {
              // If reference bit = 0 → replace
              if(ref[pointer] === 0) {
                  victim = frames[pointer];
                  frames[pointer] = pages[i];
                  ref[pointer] = 1;
                  pointer = (pointer + 1) % f;
                  break;
              }
              // If reference bit = 1 → give second chance
              else {
                  ref[pointer] = 0;
                  pointer = (pointer + 1) % f;
              }
          }
      }

      steps.push({
        step: i,
        page: pages[i],
        framesSnapshot: frames.slice(),
        frameCount: f,
        pageFault: (flag === 0),
        victimPage: victim,
        refBitSnapshot: ref.slice()
      });
  }

  return { steps, totalFaults: faults, totalHits: hits, algorithmName: 'Clock' };
}
