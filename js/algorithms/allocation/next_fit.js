/*
 * next_fit.js
 * Next Fit allocation: like First Fit but resumes scanning from
 * where the last allocation ended (lastAllocatedIndex).
 * Distributes allocations more evenly across memory.
 * JS port of c/algorithms/allocation/next_fit.c
 */

import { makeMemoryMap, computeStats } from './first_fit.js';
export { makeMemoryMap };

function coalesce(blocks, map) {
  let i = 0;
  while (i < blocks.length - 1) {
    if (blocks[i].isFree && blocks[i + 1].isFree) {
      blocks[i].size += blocks[i + 1].size;
      blocks.splice(i + 1, 1);
      if (map.lastAllocatedIndex > i) map.lastAllocatedIndex--;
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

export function nextFitAllocate(map, processId, size) {
  const n = map.blocks.length;
  const start = map.lastAllocatedIndex % n;
  for (let t = 0; t < n; t++) {
    const i = (start + t) % map.blocks.length;
    if (map.blocks[i].isFree && map.blocks[i].size >= size) {
      splitBlock(map.blocks, i, size);
      map.blocks[i].isFree = false;
      map.blocks[i].processId = processId;
      map.lastAllocatedIndex = i;
      return map.blocks[i].base;
    }
  }
  return -1;
}

export function nextFitFree(map, processId) {
  for (let i = 0; i < map.blocks.length; i++) {
    if (!map.blocks[i].isFree && map.blocks[i].processId === processId) {
      map.blocks[i].isFree = true;
      map.blocks[i].processId = -1;
    }
  }
  coalesce(map.blocks, map);
}

export function nextFitStats(map) {
  return computeStats(map);
}
