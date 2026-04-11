/*
 * paging_view.js
 * View functions for rendering address translation results,
 * page table entries, and TLB state. No algorithm logic.
 */

export function renderTranslationResult(containerId, tr) {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (tr.pageFault) {
    el.innerHTML = `<div class="result-block error">
      <strong>Page Fault!</strong>
      <p>Page ${tr.pageNumber} is not in memory.</p>
      <p>Logical: ${tr.logicalAddress} → Page: ${tr.pageNumber}, Offset: ${tr.offset}</p>
    </div>`;
    return;
  }

  const hitLabel = tr.tlbHit ? '<span style="color:var(--success)">TLB Hit</span>' : '<span style="color:var(--purple-mid)">TLB Miss</span>';
  el.innerHTML = `<div class="result-block success">
    <strong>Translation Successful</strong> ${hitLabel}
    <p>Logical: <strong>${tr.logicalAddress}</strong> → Physical: <strong>${tr.physicalAddress}</strong></p>
    <p>Page: ${tr.pageNumber} | Offset: ${tr.offset} | Frame: ${tr.frameNumber}</p>
  </div>`;
}

export function renderPageTable(containerId, pt) {
  const el = document.getElementById(containerId);
  if (!el || !pt) return;

  let html = `<h3 style="margin-top:16px">Page Table <small style="font-weight:400;color:var(--text-muted)">(size: ${pt.pageSize} bytes/page)</small></h3>`;
  html += '<div class="table-scroll"><table><thead><tr><th>Page</th><th>Frame</th><th>Valid</th><th>Access Count</th></tr></thead><tbody>';

  for (const e of pt.entries) {
    html += `<tr>
      <td>${e.pageNumber}</td>
      <td>${e.valid ? e.frameNumber : '—'}</td>
      <td>${e.valid ? '✓' : '✗'}</td>
      <td>${e.accessCount}</td>
    </tr>`;
  }

  html += '</tbody></table></div>';
  html += `<div class="stats-row"><div class="stat-item">Accesses: <span>${pt.accessCount}</span></div><div class="stat-item">Faults: <span>${pt.faultCount}</span></div></div>`;
  el.innerHTML = html;
}

export function renderTLB(containerId, tlb) {
  const el = document.getElementById(containerId);
  if (!el || !tlb) return;

  const ratio = (tlbHitRatioVal(tlb) * 100).toFixed(1);
  let html = `<h3 style="margin-top:16px">TLB <small style="font-weight:400;color:var(--text-muted)">Hit ratio: ${ratio}%</small></h3>`;
  html += '<table><thead><tr><th>Slot</th><th>Page</th><th>Frame</th><th>Valid</th></tr></thead><tbody>';

  for (let i = 0; i < tlb.entries.length; i++) {
    const e = tlb.entries[i];
    html += `<tr>
      <td>${i}</td>
      <td>${e.valid ? e.pageNumber : '—'}</td>
      <td>${e.valid ? e.frameNumber : '—'}</td>
      <td>${e.valid ? '✓' : '✗'}</td>
    </tr>`;
  }

  html += '</tbody></table>';
  el.innerHTML = html;
}

function tlbHitRatioVal(tlb) {
  const total = tlb.hits + tlb.misses;
  return total === 0 ? 0 : tlb.hits / total;
}
