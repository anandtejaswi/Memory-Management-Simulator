/*
 * multi_level_page_table.js
 * 2-level page table splitting a 32-bit virtual address into:
 * [L1 index: 10 bits][L2 index: 10 bits][Offset: 12 bits]
 * L1 table is always resident; L2 tables are created on demand.
 * Saves memory vs a single flat page table for sparse address spaces.
 * JS port of c/algorithms/virtual_memory/multi_level_pt.c
 */

const L2_BITS = 10;
const OFFSET_BITS = 12;

export function mlPtInit() {
  return { l1: {}, pageSize: 4096, faultCount: 0 };
}

export function mlPtMap(pt, virtualAddress, frameNumber) {
  const l1Idx = (virtualAddress >>> (L2_BITS + OFFSET_BITS)) & 0x3FF;
  const l2Idx = (virtualAddress >>> OFFSET_BITS) & 0x3FF;
  if (!pt.l1[l1Idx]) pt.l1[l1Idx] = { present: true, table: {} };
  pt.l1[l1Idx].table[l2Idx] = { frameNumber, valid: true };
}

export function mlPtTranslate(pt, virtualAddress) {
  const l1Idx = (virtualAddress >>> (L2_BITS + OFFSET_BITS)) & 0x3FF;
  const l2Idx = (virtualAddress >>> OFFSET_BITS) & 0x3FF;
  const offset = virtualAddress & 0xFFF;

  const tr = {
    virtualAddress,
    l1Index: l1Idx,
    l2Index: l2Idx,
    offset,
    physicalAddress: -1,
    fault: false,
    levelsWalked: 1
  };

  if (!pt.l1[l1Idx] || !pt.l1[l1Idx].present) {
    tr.fault = true;
    pt.faultCount++;
    return tr;
  }

  tr.levelsWalked = 2;
  const entry = pt.l1[l1Idx].table[l2Idx];
  if (!entry || !entry.valid) {
    tr.fault = true;
    pt.faultCount++;
    return tr;
  }

  tr.physicalAddress = (entry.frameNumber << OFFSET_BITS) | offset;
  return tr;
}

export function mlPtGetMemoryOverhead(pt) {
  const L1_SIZE = 1024, L2_SIZE = 1024;
  const entrySize = 8; /* bytes per entry estimate */
  let overhead = L1_SIZE * entrySize;
  for (const key of Object.keys(pt.l1)) {
    if (pt.l1[key].present) overhead += L2_SIZE * entrySize;
  }
  return overhead;
}
