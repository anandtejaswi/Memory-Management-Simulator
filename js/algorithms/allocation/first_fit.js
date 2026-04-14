/*
 * first_fit.js
 * First Fit allocation: scan from index 0 and allocate the first
 * free block >= requested size. O(n) per allocation.
 * Fast but causes clustering of small fragments at low addresses.
 * JS port of c/algorithms/allocation/first_fit.c
 */

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

export function makeMemoryMap(totalSize) {
  return {
    blocks: [{ id: 0, base: 0, size: totalSize, isFree: true, processId: -1 }],
    totalSize,
    lastAllocatedIndex: 0
  };
}

export function firstFitAllocate(map, processId, size) {
  let m = map.blocks.length;
  let n = 1;
  let blockSize = [];
  for(let k = 0; k < m; k++) {
    blockSize[k] = map.blocks[k].isFree ? map.blocks[k].size : 0;
  }
  let processSize = [size];
  let allocation = [-1];

  let i = 0;
  for(let j = 0; j < m; j++) {
      if(blockSize[j] >= processSize[i]) {
          allocation[i] = j;
          blockSize[j] -= processSize[i];
          break;
      }
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

export function firstFitFree(map, processId) {
  for (let i = 0; i < map.blocks.length; i++) {
    if (!map.blocks[i].isFree && map.blocks[i].processId === processId) {
      map.blocks[i].isFree = true;
      map.blocks[i].processId = -1;
    }
  }
  coalesce(map.blocks);
}

export function firstFitStats(map) {
  return computeStats(map);
}

export function computeStats(map) {
  let usedSize = 0, freeSize = 0, freeBlockCount = 0, largestFree = 0;
  for (const b of map.blocks) {
    if (b.isFree) {
      freeSize += b.size;
      freeBlockCount++;
      if (b.size > largestFree) largestFree = b.size;
    } else {
      usedSize += b.size;
    }
  }
  const externalFrag = freeBlockCount > 1 ? freeSize - largestFree : 0;
  return {
    totalSize: map.totalSize,
    usedSize,
    freeSize,
    externalFragmentation: externalFrag,
    internalFragmentation: 0,
    blockCount: map.blocks.length,
    freeBlockCount
  };
}
