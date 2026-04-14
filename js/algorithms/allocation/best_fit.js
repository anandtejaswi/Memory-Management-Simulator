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
  let m = map.blocks.length;
  let n = 1;
  let blockSize = [];
  for(let k = 0; k < m; k++) {
    blockSize[k] = map.blocks[k].isFree ? map.blocks[k].size : 0;
  }
  let processSize = [size];
  let allocation = [-1];

  let i = 0;
  let bestIdx = -1;
  for(let j = 0; j < m; j++) {
      if(blockSize[j] >= processSize[i]) {
          if(bestIdx === -1 || blockSize[j] < blockSize[bestIdx])
              bestIdx = j;
      }
  }

  if(bestIdx !== -1) {
      allocation[i] = bestIdx;
      blockSize[bestIdx] -= processSize[i];
  }

  if(allocation[0] !== -1) {
      let j = allocation[0];
      splitBlock(map.blocks, j, size);
      map.blocks[j].isFree = false;
      map.blocks[j].processId = processId;
      map.lastAllocatedIndex = j;
      return map.blocks[j].base;
  }
  return -1;
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
