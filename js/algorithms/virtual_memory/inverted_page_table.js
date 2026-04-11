/*
 * inverted_page_table.js
 * One entry per physical frame (not per virtual page). Each entry
 * stores (pid, pageNumber). To translate, search for (pid, page).
 * O(n) linear search. Memory proportional to physical memory.
 * JS port of c/algorithms/virtual_memory/inverted_pt.c
 */

export function iptInit(frameCount) {
  const table = new Array(frameCount).fill(null).map(() => ({
    pid: -1, pageNumber: -1, valid: false
  }));
  return { table, frameCount };
}

export function iptLoad(ipt, frame, pid, pageNumber) {
  if (frame >= 0 && frame < ipt.frameCount) {
    ipt.table[frame] = { pid, pageNumber, valid: true };
  }
}

export function iptTranslate(ipt, pid, pageNumber, offset) {
  const tr = {
    pid,
    pageNumber,
    frameNumber: -1,
    physicalAddress: -1,
    fault: true,
    searchSteps: 0
  };

  for (let i = 0; i < ipt.frameCount; i++) {
    tr.searchSteps++;
    const e = ipt.table[i];
    if (e.valid && e.pid === pid && e.pageNumber === pageNumber) {
      tr.frameNumber = i;
      tr.physicalAddress = i * 4096 + offset;
      tr.fault = false;
      return tr;
    }
  }
  return tr;
}

export function iptFreeProcess(ipt, pid) {
  for (const e of ipt.table) {
    if (e.valid && e.pid === pid) e.valid = false;
  }
}
