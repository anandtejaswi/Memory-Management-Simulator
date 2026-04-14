/*
 * lru.js
 * LRU page replacement: evicts the page whose last use was furthest
 * in the past. Tracks last-use timestamps per frame. O(n) per fault.
 * Does not exhibit Belady's anomaly. Stack algorithm.
 * JS port of c/algorithms/page_replacement/lru.c
 */

export function lruSimulate(input) {
  let pages = input.refString;
  let n = pages.length;
  let f = input.frames;
  let frames = [];
  let i, j;
  let pageFaults = 0, hits = 0;

  let time = [], counter = 0, pos, min;

  for(i = 0; i < f; i++) {
      frames[i] = -1;
      time[i] = 0;
  }

  let steps = [];

  for(i = 0; i < n; i++) {
      let flag = 0;
      let victim = -1;

      // Check HIT
      for(j = 0; j < f; j++) {
          if(frames[j] === pages[i]) {
              flag = 1;
              hits++;
              counter++;
              time[j] = counter;
              break;
          }
      }

      // If FAULT
      if(flag === 0) {
          pageFaults++;
          counter++;

          min = time[0];
          pos = 0;

          for(j = 1; j < f; j++) {
              if(time[j] < min) {
                  min = time[j];
                  pos = j;
              }
          }

          victim = frames[pos];
          frames[pos] = pages[i];
          time[pos] = counter;
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

  return { steps, totalFaults: pageFaults, totalHits: hits, algorithmName: 'LRU' };
}
