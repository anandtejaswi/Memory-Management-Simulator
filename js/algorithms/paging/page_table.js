/*
 * page_table.js
 * Flat page table with TLB-assisted address translation.
 * Each virtual page maps to a frame. Page fault when valid=false.
 * JS port of c/algorithms/paging/page_table.c and tlb.c
 */

export function pageTableInit(pageSize, numPages) {
  const entries = [];
  for (let i = 0; i < numPages; i++) {
    entries.push({
      pageNumber: i,
      frameNumber: i,
      valid: true,
      dirty: false,
      referenced: false,
      accessCount: 0,
      lastAccessTime: -1
    });
  }
  return {
    entries,
    pageCount: numPages,
    pageSize,
    faultCount: 0,
    accessCount: 0
  };
}

export function loadPage(pt, pageNumber, frameNumber) {
  while (pt.entries.length <= pageNumber) {
    pt.entries.push({
      pageNumber: pt.entries.length,
      frameNumber: -1,
      valid: false,
      dirty: false,
      referenced: false,
      accessCount: 0,
      lastAccessTime: -1
    });
  }
  pt.entries[pageNumber].frameNumber = frameNumber;
  pt.entries[pageNumber].valid = true;
  if (pageNumber >= pt.pageCount) pt.pageCount = pageNumber + 1;
}

export function invalidatePage(pt, pageNumber) {
  if (pageNumber < pt.entries.length) {
    pt.entries[pageNumber].valid = false;
  }
}

export function translateAddress(pt, tlb, logicalAddress) {
  const pageNumber = Math.floor(logicalAddress / pt.pageSize);
  const offset = logicalAddress % pt.pageSize;
  const tr = {
    logicalAddress,
    pageNumber,
    offset,
    frameNumber: -1,
    physicalAddress: -1,
    pageFault: false,
    tlbHit: false
  };

  const tlbResult = tlbLookup(tlb, pageNumber);
  if (tlbResult !== -1) {
    tr.tlbHit = true;
    tr.frameNumber = tlbResult;
  } else {
    if (pageNumber < pt.entries.length && pt.entries[pageNumber].valid) {
      tr.frameNumber = pt.entries[pageNumber].frameNumber;
      tlbInsert(tlb, pageNumber, tr.frameNumber);
    } else {
      tr.pageFault = true;
      pt.faultCount++;
      pt.accessCount++;
      return tr;
    }
  }

  tr.physicalAddress = tr.frameNumber * pt.pageSize + offset;
  pt.entries[pageNumber].accessCount++;
  pt.entries[pageNumber].referenced = true;
  pt.entries[pageNumber].lastAccessTime = pt.accessCount;
  pt.accessCount++;
  return tr;
}

/* ===== TLB ===== */
export function tlbInit() {
  return {
    entries: new Array(16).fill(null).map(() => ({
      pageNumber: -1, frameNumber: -1, valid: false, lastUsed: -1
    })),
    hits: 0,
    misses: 0,
    time: 0
  };
}

export function tlbLookup(tlb, pageNumber) {
  tlb.time++;
  for (const e of tlb.entries) {
    if (e.valid && e.pageNumber === pageNumber) {
      e.lastUsed = tlb.time;
      tlb.hits++;
      return e.frameNumber;
    }
  }
  tlb.misses++;
  return -1;
}

export function tlbInsert(tlb, pageNumber, frameNumber) {
  tlb.time++;
  let victim = tlb.entries.findIndex(e => !e.valid);
  if (victim === -1) {
    victim = 0;
    let minT = tlb.entries[0].lastUsed;
    for (let i = 1; i < tlb.entries.length; i++) {
      if (tlb.entries[i].lastUsed < minT) { minT = tlb.entries[i].lastUsed; victim = i; }
    }
  }
  tlb.entries[victim] = { pageNumber, frameNumber, valid: true, lastUsed: tlb.time };
}

export function tlbFlush(tlb) {
  for (const e of tlb.entries) { e.valid = false; e.pageNumber = -1; }
  tlb.hits = 0;
  tlb.misses = 0;
}

export function tlbHitRatio(tlb) {
  const total = tlb.hits + tlb.misses;
  return total === 0 ? 0 : tlb.hits / total;
}
