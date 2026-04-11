/*
 * memory_map_view.js
 * View functions for rendering memory maps and allocation stats.
 * Receives data objects and returns/mutates DOM. No algorithm logic.
 */

export function renderMemoryMap(containerId, map) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!map || map.blocks.length === 0) { el.innerHTML = ''; return; }

  const total = map.totalSize;
  let html = '<div class="memory-map-bar">';
  for (const b of map.blocks) {
    const pct = (b.size / total * 100).toFixed(2);
    const cls = b.isFree ? 'free' : 'allocated';
    const label = b.isFree ? `Free\n${b.size}KB` : `P${b.processId}\n${b.size}KB`;
    html += `<div class="mem-block ${cls}" style="flex:${pct}" title="Base:${b.base} Size:${b.size}KB">`;
    if (pct > 5) {
      const lines = label.split('\n');
      html += `<span>${lines[0]}</span>`;
      if (lines[1]) html += `<span style="font-size:10px;color:inherit;opacity:.75">${lines[1]}</span>`;
    }
    html += '</div>';
  }
  html += '</div>';
  el.innerHTML = html;
}

export function renderStatsTable(containerId, stats, processTable) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const utilPct = stats.totalSize > 0 ? (stats.usedSize / stats.totalSize * 100).toFixed(1) : 0;
  const fragPct = stats.totalSize > 0 ? (stats.externalFragmentation / stats.totalSize * 100).toFixed(1) : 0;

  let html = `<div class="stats-row">
    <div class="stat-item">Total: <span>${stats.totalSize} KB</span></div>
    <div class="stat-item">Used: <span>${stats.usedSize} KB (${utilPct}%)</span></div>
    <div class="stat-item">Free: <span>${stats.freeSize} KB</span></div>
    <div class="stat-item">Blocks: <span>${stats.blockCount}</span></div>
    <div class="stat-item">Free Blocks: <span>${stats.freeBlockCount}</span></div>
    <div class="stat-item">Ext. Frag: <span>${stats.externalFragmentation} KB (${fragPct}%)</span></div>
  </div>`;

  if (processTable && processTable.list.length > 0) {
    html += '<h3 style="margin-top:16px">Process Table</h3>';
    html += '<div class="table-scroll"><table><thead><tr><th>PID</th><th>Requested (KB)</th><th>Base</th><th>Status</th></tr></thead><tbody>';
    for (const p of processTable.list) {
      const status = p.isActive ? 'Active' : 'Freed';
      html += `<tr><td>P${p.pid}</td><td>${p.size}</td><td>${p.baseAddress}</td><td>${status}</td></tr>`;
    }
    html += '</tbody></table></div>';
  }

  el.innerHTML = html;
}

export function renderComparisonTable(containerId, results) {
  const el = document.getElementById(containerId);
  if (!el || !results) return;

  let html = '<h3 style="margin-top:16px">Algorithm Comparison (same workload)</h3>';
  html += '<div class="table-scroll"><table><thead><tr><th>Algorithm</th><th>Used (KB)</th><th>Free (KB)</th><th>Blocks</th><th>Ext. Frag (KB)</th></tr></thead><tbody>';
  for (const r of results) {
    html += `<tr>
      <td>${r.name}</td>
      <td>${r.stats.usedSize}</td>
      <td>${r.stats.freeSize}</td>
      <td>${r.stats.blockCount}</td>
      <td>${r.stats.externalFragmentation}</td>
    </tr>`;
  }
  html += '</tbody></table></div>';
  el.innerHTML = html;
}
