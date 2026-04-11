/*
 * best_fit.js
 * Best Fit allocation: scan entire list, pick smallest block >= size.
 * O(n) per allocation. Minimises wasted space per allocation but
 * produces many tiny unusable fragments over time.
 * JS port of c/algorithms/allocation/best_fit.c
 */

import { makeMemoryMap, computeStats } from './first_fit.js';
export { makeMemoryMap };

function coalesce(blocks) {
  let i = 0;
  while (i < blocks.length - 1) {
    if (blocks[i].isFree && blocks[i + 1].isFree) {
      blocks[i].size += blocks[i + 1].size;
      blocks.splice(i + 1, 1);
    } else {
      i++;
    }
  }
}

function splitBlock(blocks, index, size) {
  const blk = blocks[index];
  if (blk.size === size) return;
  const remainder = {
    id: blocks.length,
    base: blk.base + size,
    size: blk.size - size,
    isFree: true,
    processId: -1
  };
  blk.size = size;
  blocks.splice(index + 1, 0, remainder);
}

export function bestFitAllocate(map, processId, size) {
  let best = -1;
  for (let i = 0; i < map.blocks.length; i++) {
    if (map.blocks[i].isFree && map.blocks[i].size >= size) {
      if (best === -1 || map.blocks[i].size < map.blocks[best].size) {
        best = i;
      }
    }
  }
  if (best === -1) return -1;
  splitBlock(map.blocks, best, size);
  map.blocks[best].isFree = false;
  map.blocks[best].processId = processId;
  map.lastAllocatedIndex = best;
  return map.blocks[best].base;
}

export function bestFitFree(map, processId) {
  for (let i = 0; i < map.blocks.length; i++) {
    if (!map.blocks[i].isFree && map.blocks[i].processId === processId) {
      map.blocks[i].isFree = true;
      map.blocks[i].processId = -1;
    }
  }
  coalesce(map.blocks);
}

export function bestFitStats(map) {
  return computeStats(map);
}
