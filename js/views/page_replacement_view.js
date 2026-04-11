/*
 * page_replacement_view.js
 * View functions for rendering page replacement traces, comparisons,
 * Belady anomaly results. No algorithm logic.
 */

export function renderTraceTable(containerId, result) {
  const el = document.getElementById(containerId);
  if (!el || !result) return;

  const n = result.steps.length > 0 ? result.steps[0].frameCount : 0;
  const faultCount = result.totalFaults;
  const hitCount = result.totalHits;

  let html = `<h3>${result.algorithmName} — ${faultCount} fault${faultCount !== 1 ? 's' : ''}, ${hitCount} hit${hitCount !== 1 ? 's' : ''}</h3>`;
  html += '<div class="table-scroll"><table><thead><tr><th>Step</th><th>Page</th>';
  for (let f = 0; f < n; f++) html += `<th>Frame ${f}</th>`;
  if (result.algorithmName === 'Clock') html += '<th>Ref Bits</th>';
  html += '<th>Fault?</th><th>Evicted</th></tr></thead><tbody>';

  for (const step of result.steps) {
    const cls = step.pageFault ? 'fault' : '';
    html += `<tr class="${cls}">`;
    html += `<td>${step.step + 1}</td><td><strong>${step.page}</strong></td>`;
    for (let f = 0; f < n; f++) {
      const v = step.framesSnapshot[f];
      if (v === -1 || v === undefined) {
        html += '<td><span class="frame-cell empty">—</span></td>';
      } else {
        const isCurrent = v === step.page;
        html += `<td><span class="frame-cell${isCurrent ? ' active' : ''}">${v}</span></td>`;
      }
    }
    if (result.algorithmName === 'Clock') {
      html += '<td>';
      for (let f = 0; f < n; f++) {
        const bit = step.refBitSnapshot ? step.refBitSnapshot[f] : 0;
        html += `<span class="ref-bit ${bit ? 'on' : 'off'}">${bit}</span>`;
      }
      html += '</td>';
    }
    html += `<td>${step.pageFault ? '✗' : '✓'}</td>`;
    html += `<td>${(step.victimPage !== undefined && step.victimPage !== -1) ? step.victimPage : '—'}</td>`;
    html += '</tr>';
  }

  html += '</tbody></table></div>';
  el.innerHTML = html;
}

export function renderComparisonTable(containerId, results) {
  const el = document.getElementById(containerId);
  if (!el || !results || results.length === 0) return;

  let html = '<h3 style="margin-top:16px">Algorithm Comparison</h3>';
  html += '<div class="table-scroll"><table><thead><tr><th>Algorithm</th><th>Total Faults</th><th>Total Hits</th><th>Fault Rate</th></tr></thead><tbody>';
  for (const r of results) {
    const total = r.totalFaults + r.totalHits;
    const rate = total > 0 ? ((r.totalFaults / total) * 100).toFixed(1) : '0.0';
    html += `<tr>
      <td>${r.algorithmName}</td>
      <td>${r.totalFaults}</td>
      <td>${r.totalHits}</td>
      <td>${rate}%</td>
    </tr>`;
  }
  html += '</tbody></table></div>';
  el.innerHTML = html;
}

export function renderBeladysResult(containerId, result) {
  const el = document.getElementById(containerId);
  if (!el || !result) return;

  const cls = result.anomalyDetected ? 'error' : 'success';
  let html = `<div class="result-block ${cls}">
    <strong>${result.anomalyDetected ? "Belady's Anomaly Detected!" : "No Belady's Anomaly"}</strong>
    <p>Fault counts by frame count:</p>
    <table><thead><tr><th>Frames</th><th>Faults</th></tr></thead><tbody>`;

  for (const d of result.data) {
    html += `<tr><td>${d.frames}</td><td>${d.faults}</td></tr>`;
  }
  html += '</tbody></table></div>';
  el.innerHTML = html;
}
