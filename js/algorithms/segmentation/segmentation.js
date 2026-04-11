/*
 * segmentation.js
 * Logical address space divided into named segments (code, stack, heap,
 * data, shared). Each segment has a base address and a limit. The segment
 * table stores base, limit, and protection bits (R/W/X) per segment.
 * A logical address = (segment_number, offset). Fault if offset >= limit
 * or operation violates protection bits.
 * JS port of c/algorithms/segmentation/segmentation.c
 */

export function segmentationInit(processId) {
  return { segments: [], count: 0, processId };
}

export function segmentationAddSegment(st, base, limit, read, write, execute, name) {
  const seg = {
    segmentId: st.count,
    base,
    limit,
    read,
    write,
    execute,
    processId: st.processId,
    name: String(name).slice(0, 15)
  };
  st.segments.push(seg);
  return st.count++;
}

export function segmentationTranslate(st, segmentNumber, offset, operation) {
  const tr = {
    logicalAddress: segmentNumber * 10000 + offset,
    segmentNumber,
    offset,
    physicalAddress: -1,
    fault: false,
    protectionFault: false,
    faultReason: ''
  };

  if (segmentNumber < 0 || segmentNumber >= st.segments.length) {
    tr.fault = true;
    tr.faultReason = `Invalid segment ${segmentNumber}`;
    return tr;
  }

  const seg = st.segments[segmentNumber];
  if (offset >= seg.limit) {
    tr.fault = true;
    tr.faultReason = `Offset ${offset} >= limit ${seg.limit}`;
    return tr;
  }

  /* 0=read, 1=write, 2=execute */
  if (operation === 0 && !seg.read) {
    tr.protectionFault = true;
    tr.faultReason = `Read not permitted on segment ${segmentNumber}`;
    return tr;
  }
  if (operation === 1 && !seg.write) {
    tr.protectionFault = true;
    tr.faultReason = `Write not permitted on segment ${segmentNumber}`;
    return tr;
  }
  if (operation === 2 && !seg.execute) {
    tr.protectionFault = true;
    tr.faultReason = `Execute not permitted on segment ${segmentNumber}`;
    return tr;
  }

  tr.physicalAddress = seg.base + offset;
  return tr;
}

export function segmentationRemoveSegment(st, segmentId) {
  if (segmentId < 0 || segmentId >= st.segments.length) return;
  st.segments.splice(segmentId, 1);
  st.count--;
  for (let i = 0; i < st.segments.length; i++) st.segments[i].segmentId = i;
}
