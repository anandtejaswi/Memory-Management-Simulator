/*
 * optimal.js
 * Optimal (Belady's Min) replacement: evicts the page whose next
 * use is furthest in the future. Requires full reference string
 * known in advance. Theoretical lower bound on page faults.
 * JS port of c/algorithms/page_replacement/optimal.c
 */

export function optimalSimulate(input) {
  let pages = input.refString;
  let n = pages.length;
  let f = input.frames;
  let frames = [];
  let i, j, k, pos, farthest;
  let faults = 0, hits = 0;

  for(i = 0; i < f; i++)
      frames[i] = -1;

  let steps = [];

  for(i = 0; i < n; i++) {
      let flag = 0;
      let victim = -1;

      // HIT check
      for(j = 0; j < f; j++) {
          if(frames[j] === pages[i]) {
              flag = 1;
              hits++;
              break;
          }
      }

      if(flag === 0) {
          faults++;

          pos = -1;
          farthest = i;

          for(j = 0; j < f; j++) {
              let found = 0;

              for(k = i+1; k < n; k++) {
                  if(frames[j] === pages[k]) {
                      if(k > farthest) {
                          farthest = k;
                          pos = j;
                      }
                      found = 1;
                      break;
                  }
              }

              if(found === 0) {
                  pos = j;
                  break;
              }
          }

          if(pos === -1)
              pos = 0;

          victim = frames[pos];
          frames[pos] = pages[i];
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

  return { steps, totalFaults: faults, totalHits: hits, algorithmName: 'Optimal' };
}
