/*
 * worst_fit.js
 * Worst Fit allocation: pick the largest free block.
 * O(n) per allocation. Leaves large remainders that are more reusable
 * but wastes large blocks on small requests.
 * JS port of c/algorithms/allocation/worst_fit.c
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

export function worstFitAllocate(map, processId, size) {
  let worst = -1;
  for (let i = 0; i < map.blocks.length; i++) {
    if (map.blocks[i].isFree && map.blocks[i].size >= size) {
      if (worst === -1 || map.blocks[i].size > map.blocks[worst].size) {
        worst = i;
      }
    }
  }
  if (worst === -1) return -1;
  splitBlock(map.blocks, worst, size);
  map.blocks[worst].isFree = false;
  map.blocks[worst].processId = processId;
  map.lastAllocatedIndex = worst;
  return map.blocks[worst].base;
}

export function worstFitFree(map, processId) {
  for (let i = 0; i < map.blocks.length; i++) {
    if (!map.blocks[i].isFree && map.blocks[i].processId === processId) {
      map.blocks[i].isFree = true;
      map.blocks[i].processId = -1;
    }
  }
  coalesce(map.blocks);
}

export function worstFitStats(map) {
  return computeStats(map);
}
