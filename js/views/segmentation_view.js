/*
 * segmentation_view.js
 * View functions for segmentation table, translation results,
 * and memory map for segments. No algorithm logic.
 */

export function renderSegmentTable(containerId, st) {
  const el = document.getElementById(containerId);
  if (!el || !st) return;

  if (st.segments.length === 0) {
    el.innerHTML = '<div class="result-block"><strong>No segments defined yet.</strong> Add a segment using the controls.</div>';
    return;
  }

  let html = '<h3>Segment Table</h3>';
  html += '<div class="table-scroll"><table><thead><tr><th>#</th><th>Name</th><th>Base</th><th>Limit</th><th>R</th><th>W</th><th>X</th></tr></thead><tbody>';
  for (const s of st.segments) {
    html += `<tr>
      <td>${s.segmentId}</td>
      <td>${s.name}</td>
      <td>${s.base}</td>
      <td>${s.limit}</td>
      <td>${s.read ? '✓' : '✗'}</td>
      <td>${s.write ? '✓' : '✗'}</td>
      <td>${s.execute ? '✓' : '✗'}</td>
    </tr>`;
  }
  html += '</tbody></table></div>';
  el.innerHTML = html;
}

export function renderSegTranslation(containerId, tr) {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (tr.fault) {
    el.innerHTML = `<div class="result-block error">
      <strong>Segmentation Fault!</strong>
      <p>${tr.faultReason}</p>
      <p>Segment: ${tr.segmentNumber}, Offset: ${tr.offset}</p>
    </div>`;
    return;
  }
  if (tr.protectionFault) {
    el.innerHTML = `<div class="result-block error">
      <strong>Protection Fault!</strong>
      <p>${tr.faultReason}</p>
    </div>`;
    return;
  }

  el.innerHTML = `<div class="result-block success">
    <strong>Translation Successful</strong>
    <p>Logical (${tr.segmentNumber}, ${tr.offset}) → Physical: <strong>${tr.physicalAddress}</strong></p>
  </div>`;
}

export function renderSegMemoryMap(containerId, st) {
  const el = document.getElementById(containerId);
  if (!el || !st || st.segments.length === 0) { if (el) el.innerHTML = ''; return; }

  const total = st.segments.reduce((max, s) => Math.max(max, s.base + s.limit), 0) || 1;
  let html = '<h3 style="margin-top:16px">Memory Layout</h3><div class="memory-map-bar">';
  for (const s of st.segments) {
    const pct = ((s.limit / total) * 100).toFixed(2);
    html += `<div class="mem-block allocated" style="flex:${pct}" title="${s.name}: base=${s.base} limit=${s.limit}">
      <span>${s.name}</span>
      <span style="font-size:10px;opacity:.75">${s.limit}</span>
    </div>`;
  }
  html += '</div>';
  el.innerHTML = html;
}
